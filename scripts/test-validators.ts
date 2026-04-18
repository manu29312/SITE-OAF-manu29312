import assert from 'node:assert/strict';
import {
	isClientStatus,
	isContractStatus,
	isEmail,
	isInvoiceStatus,
	isIsoDate,
	isNonNegativeNumber,
	isPositiveAmount,
	requireText,
} from '@/lib/validators';

function runTests(): void {
	assert.equal(requireText('ab'), true);
	assert.equal(requireText(' a '), false);

	assert.equal(isEmail('hello@example.com'), true);
	assert.equal(isEmail('no-at-sign.example.com'), false);

	assert.equal(isIsoDate('2026-12-24'), true);
	assert.equal(isIsoDate('24/12/2026'), false);

	assert.equal(isPositiveAmount(10), true);
	assert.equal(isPositiveAmount(0), false);
	assert.equal(isNonNegativeNumber(0), true);
	assert.equal(isNonNegativeNumber(-1), false);

	assert.equal(isClientStatus('actif'), true);
	assert.equal(isClientStatus('paused'), false);

	assert.equal(isContractStatus('a_renouveler'), true);
	assert.equal(isContractStatus('closed'), false);

	assert.equal(isInvoiceStatus('retard'), true);
	assert.equal(isInvoiceStatus('sent'), false);
}

try {
	runTests();
	console.log('OK: validateurs critiques verifies.');
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`Echec des tests validateurs: ${message}`);
	process.exit(1);
}