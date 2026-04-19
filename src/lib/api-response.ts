import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

type ApiErrorPayload = {
  error: string;
  code: ApiErrorCode;
};

type KnownApiError = {
  status: number;
  message: string;
  code: ApiErrorCode;
};

export function apiData<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function apiError(message: string, code: ApiErrorCode, status: number): NextResponse<ApiErrorPayload> {
  return NextResponse.json({ error: message, code }, { status });
}

export function fromCaughtError(error: unknown, extraKnown: Record<string, KnownApiError> = {}): NextResponse<ApiErrorPayload> {
  const knownErrorMap: Record<string, KnownApiError> = {
    UNAUTHORIZED: {
      status: 401,
      message: 'Authentification requise.',
      code: 'UNAUTHORIZED',
    },
    ...extraKnown,
  };

  if (error instanceof Error) {
    const known = knownErrorMap[error.message];
    if (known) {
      return apiError(known.message, known.code, known.status);
    }
  }

  return apiError('Erreur serveur.', 'INTERNAL_ERROR', 500);
}
