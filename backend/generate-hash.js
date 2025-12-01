import bcrypt from 'bcryptjs';

const senha = 'senha123';
const hash = bcrypt.hashSync(senha, 10);

console.log('Hash gerado:', hash);
console.log('\nExecute no PostgreSQL:');
console.log(`UPDATE usuarios SET senha_hash = '${hash}' WHERE id IN (1, 2, 3);`);
