import { getVaultCharacters } from '@/features/characters/api';
import EnrollClientForm from './EnrollClientForm';

export default async function EnrollPage() {
  const vaultCharacters = await getVaultCharacters();

  return (
    <div className="w-full max-w-3xl mx-auto h-full min-h-[70vh] flex flex-col justify-center space-y-8 p-4 mt-8">
      
      <div className="text-center space-y-3">
        <h1 className="font-cinzel text-2xl md:text-3xl tracking-widest text-(--text) uppercase text-glow shadow-sm">
          Protocolo de Admisión
        </h1>
        <p className="font-mono text-sm text-(--text-muted) max-w-xl mx-auto">
          Para ingresar al entorno de The Murder Academy debes registrar un talento definitivo. 
          Al vincular tu personaje del TMC Character Vault, autorizas su entrada al sistema cerrado.
        </p>
      </div>

      <EnrollClientForm vaultCharacters={vaultCharacters} />

    </div>
  );
}
