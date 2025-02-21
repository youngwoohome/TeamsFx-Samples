import { Activity, TurnContext } from "botbuilder";
import {
  CommandMessage,
  TriggerPatterns,
  TeamsFxBotSsoCommandHandler,
  TeamsBotSsoPromptTokenResponse,
  OnBehalfOfUserCredential,
  createMicrosoftGraphClientWithCredential,
} from "@microsoft/teamsfx";
import oboAuthConfig from "./authConfig";

export class ProfileSsoCommandHandler implements TeamsFxBotSsoCommandHandler {
  triggerPatterns: TriggerPatterns = "profile";

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage,
    tokenResponse: TeamsBotSsoPromptTokenResponse,
  ): Promise<string | Partial<Activity> | void> {
    await context.sendActivity("Retrieving user information from Microsoft Graph ...");

    // Init OnBehalfOfUserCredential instance with SSO token
    const oboCredential = new OnBehalfOfUserCredential(tokenResponse.ssoToken, oboAuthConfig);
    // Add scope for your Azure AD app. For example: Mail.Read, etc.
    const graphClient = createMicrosoftGraphClientWithCredential(oboCredential,  ["User.Read"]);

    // Call graph api use `graph` instance to get user profile information
    const me = await graphClient.api("/me").get();

    if (me) {
      // Bot will send the user profile info to user
      return `Your command is '${message.text}' and you're logged in as ${me.displayName} (${me.userPrincipalName})${me.jobTitle ? `; your job title is: ${me.jobTitle}` : ""
        }.`;
    } else {
      return "Could not retrieve profile information from Microsoft Graph.";
    }
  }
}
