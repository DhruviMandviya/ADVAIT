import { mockStudents } from '../src/data/mockStudents.ts';
import { mockComplianceCases } from '../src/data/mockComplianceCases.ts';

console.log('=== AUDIT OF MOCK DATA ===');
console.log('Total mock students:', mockStudents.length);

const coepStudents = mockStudents.filter(s => s.institutionId === 'INST102');
console.log('COEP (INST102) total students:', coepStudents.length);

const coepFlagged = coepStudents.filter(s => s.status === 'Flagged');
console.log('COEP (INST102) flagged students count:', coepFlagged.length);
coepFlagged.forEach(s => {
  console.log(` - ${s.id}: ${s.name} | ${s.apaarId} | flagType: ${s.flagType} | ${s.flagReason}`);
});

console.log('\nTotal mock compliance cases:', mockComplianceCases.length);
const coepCases = mockComplianceCases.filter(c => c.institutionIds.includes('INST102'));
console.log('COEP (INST102) compliance cases count:', coepCases.length);
coepCases.forEach(c => {
  console.log(` - ${c.id}: ${c.title} | issueType: ${c.issueType} | status: ${c.status} | notices: ${c.notices.length} | responses: ${c.responses.length}`);
});

