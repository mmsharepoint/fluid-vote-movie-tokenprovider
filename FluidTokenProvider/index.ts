import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ScopeType } from "@fluidframework/azure-client";
import { generateToken } from "@fluidframework/azure-service-utils";
import { getSecret } from "./keyVault";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const tenantId = process.env.TENANTID;
  const documentId = (req.query.documentId || (req.body && req.body.documentId)) as string | undefined;
  const userId = (req.query.userId || (req.body && req.body.userId)) as string;
  const userName = (req.query.userName || (req.body && req.body.userName)) as string;
  const scopes = [process.env.SCOPES] as ScopeType[]; // "doc:read", "doc:write", "summary:write"

  if (!tenantId) {
    context.res = {
      status: 400,
      body: "No tenantId provided in query params",
    };
    return;
  }
  const key = await getSecret("AzureFluidRelay"); // Name of KeyVault secret
  if (!key) {
    context.res = {
      status: 404,
      body: `No key found for the provided tenantId: ${tenantId}`,
    };
    return;
  }

  let user = { name: userName, id: userId };

  // Will generate the token and returned by an ITokenProvider implementation to use with the AzureClient.
  const token = generateToken(
    tenantId,
    key,
    scopes ?? [ScopeType.DocRead, ScopeType.DocWrite, ScopeType.SummaryWrite],
    documentId,
    user
  );

  context.res = {
    status: 200,
    body: token
  };

};

export default httpTrigger;