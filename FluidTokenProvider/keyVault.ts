import { DefaultAzureCredential, EnvironmentCredential, ManagedIdentityCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

export const getSecret = async (name: string): Promise<string> => {
  const client = getSecretClient();
  try {
    const secret = await client.getSecret(name);
    return secret.value!;
  }
  catch (err) {
    console.log(err);
    return "";
  }
};

const getSecretClient = (): SecretClient => {
  const connectionString = process.env.AZURE_KEYVAULT_CONNECTION_STRING!;
  const credential = new DefaultAzureCredential();
  const client = new SecretClient(connectionString, credential);
  return client;
};