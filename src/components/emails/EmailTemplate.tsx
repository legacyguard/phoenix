import React from "react";
import { useTranslation } from "react-i18next";

interface EmailTemplateProps {
  type:
    | "welcome"
    | "verification"
    | "passwordReset"
    | "taskReminder"
    | "documentExpiry"
    | "securityAlert"
    | "subscription"
    | "familyInvitation";
  data: {
    userName?: string;
    lastName?: string;
    documentName?: string;
    date?: string;
    count?: number;
    memberName?: string;
    level?: string;
    timestamp?: string;
    location?: string;
    device?: string;
    activityType?: string;
    days?: number;
    paymentError?: string;
    retryDate?: string;
    accessEndDate?: string;
    retentionDays?: number;
    senderName?: string;
    role?: string;
    ownerName?: string;
    accessLevel?: string;
    startTime?: string;
    endTime?: string;
    timezone?: string;
    statusUrl?: string;
  };
  buttons?: Array<{
    text: string;
    url: string;
  }>;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({
  type,
  data,
  buttons = [],
}) => {
  const { t } = useTranslation("sharing");

  const renderTemplate = () => {
    switch (type) {
      case "welcome":
        return (
          <div className="email-content">
            <h1>{t("welcome.headline")}</h1>
            <p>{t("welcome.introduction")}</p>
            <h2>{t("welcome.whatNext")}</h2>
            <ol>
              <li>{t("welcome.step1")}</li>
              <li>{t("welcome.step2")}</li>
              <li>{t("welcome.step3")}</li>
              <li>{t("welcome.step4")}</li>
            </ol>
            {buttons.length > 0 && (
              <div className="email-buttons">
                {buttons.map((button, index) => (
                  <a key={index} href={button.url} className="email-button">
                    {button.text}
                  </a>
                ))}
              </div>
            )}
            <p>{t("welcome.supportMessage")}</p>
            <p>
              <em>{t("welcome.securityNote")}</em>
            </p>
          </div>
        );

      case "verification":
        return (
          <div className="email-content">
            <h1>{t("verification.headline")}</h1>
            <p>{t("verification.message")}</p>
            <p>{t("verification.instruction")}</p>
            {buttons.length > 0 && (
              <div className="email-buttons">
                {buttons.map((button, index) => (
                  <a key={index} href={button.url} className="email-button">
                    {button.text}
                  </a>
                ))}
              </div>
            )}
            <p>{t("verification.alternativeLink")}</p>
            <p>
              <em>{t("verification.linkExpiry")}</em>
            </p>
            <p>{t("verification.alreadyVerified")}</p>
            <p>{t("verification.troubleshooting")}</p>
          </div>
        );

      case "passwordReset":
        return (
          <div className="email-content">
            <h1>{t("passwordReset.headline")}</h1>
            <p>{t("passwordReset.message")}</p>
            {buttons.length > 0 && (
              <div className="email-buttons">
                {buttons.map((button, index) => (
                  <a key={index} href={button.url} className="email-button">
                    {button.text}
                  </a>
                ))}
              </div>
            )}
            <p>{t("passwordReset.notRequested")}</p>
            <p>
              <em>{t("passwordReset.linkExpiry")}</em>
            </p>
            <p>{t("passwordReset.securityTip")}</p>
            <p>{t("passwordReset.contactSupport")}</p>
          </div>
        );

      case "taskReminder":
        return (
          <div className="email-content">
            <h1>{t("ui.taskReminder.headline")}</h1>
            <p>{t("ui.taskReminder.message")}</p>
            <p>
              {t("notifications.taskReminder.pendingTasks", {
                count: data.count,
              })}
            </p>
            <h3>{t("ui.taskReminder.highPriority")}</h3>
            {buttons.length > 0 && (
              <div className="email-buttons">
                {buttons.map((button, index) => (
                  <a key={index} href={button.url} className="email-button">
                    {button.text}
                  </a>
                ))}
              </div>
            )}
            <p>{t("ui.taskReminder.encouragement")}</p>
            <p>{t("ui.taskReminder.noRush")}</p>
          </div>
        );

      case "documentExpiry":
        return (
          <div className="email-content">
            <h1>{t("ui.documentExpiry.headline")}</h1>
            <p>{t("ui.documentExpiry.message")}</p>
            <p>
              <strong>
                {t("notifications.documentExpiry.documentName", {
                  documentName: data.documentName,
                })}
              </strong>
            </p>
            <p>
              <strong>
                {t("notifications.documentExpiry.expiryDate", {
                  date: data.date,
                })}
              </strong>
            </p>
            <p>{t("ui.documentExpiry.action")}</p>
            {buttons.length > 0 && (
              <div className="email-buttons">
                {buttons.map((button, index) => (
                  <a key={index} href={button.url} className="email-button">
                    {button.text}
                  </a>
                ))}
              </div>
            )}
            <p>{t("ui.documentExpiry.importance")}</p>
          </div>
        );

      case "securityAlert":
        return (
          <div className="email-content">
            <h1>{t("ui.loginAlert.headline")}</h1>
            <p>{t("ui.loginAlert.message")}</p>
            <h3>{t("ui.loginAlert.details")}</h3>
            <ul>
              <li>
                {t("security.loginAlert.time", { timestamp: data.timestamp })}
              </li>
              <li>
                {t("security.loginAlert.location", { location: data.location })}
              </li>
              <li>
                {t("security.loginAlert.device", { device: data.device })}
              </li>
            </ul>
            <p>{t("ui.loginAlert.wasYou")}</p>
            <p>{t("ui.loginAlert.notYou")}</p>
            <ul>
              <li>{t("ui.loginAlert.action1")}</li>
              <li>{t("ui.loginAlert.action2")}</li>
              <li>{t("ui.loginAlert.action3")}</li>
            </ul>
            {buttons.length > 0 && (
              <div className="email-buttons">
                {buttons.map((button, index) => (
                  <a key={index} href={button.url} className="email-button">
                    {button.text}
                  </a>
                ))}
              </div>
            )}
            <p>{t("ui.loginAlert.supportContact")}</p>
          </div>
        );

      case "subscription":
        return (
          <div className="email-content">
            <h1>{t("subscription.trialExpiring.headline")}</h1>
            <p>
              {t("subscription.trialExpiring.message", { days: data.days })}
            </p>
            <h3>{t("subscription.trialExpiring.whatHappens")}</h3>
            <ul>
              <li>{t("subscription.trialExpiring.consequence1")}</li>
              <li>{t("subscription.trialExpiring.consequence2")}</li>
              <li>{t("subscription.trialExpiring.consequence3")}</li>
            </ul>
            <p>{t("subscription.trialExpiring.continueProtection")}</p>
            {buttons.length > 0 && (
              <div className="email-buttons">
                {buttons.map((button, index) => (
                  <a key={index} href={button.url} className="email-button">
                    {button.text}
                  </a>
                ))}
              </div>
            )}
            <p>{t("subscription.trialExpiring.noCommitment")}</p>
            <p>{t("subscription.trialExpiring.questions")}</p>
          </div>
        );

      case "familyInvitation":
        return (
          <div className="email-content">
            <h1>{t("family.invitationSent.headline")}</h1>
            <p>
              {t("family.invitationSent.message", {
                senderName: data.senderName,
              })}
            </p>
            <p>
              <strong>
                {t("family.invitationSent.role", { role: data.role })}
              </strong>
            </p>
            <p>
              {t("family.invitationSent.responsibility", {
                senderName: data.senderName,
              })}
            </p>
            <h3>{t("family.invitationSent.whatNext")}</h3>
            <ul>
              <li>{t("family.invitationSent.access1")}</li>
              <li>
                {t("family.invitationSent.access2", {
                  senderName: data.senderName,
                })}
              </li>
              <li>{t("family.invitationSent.access3")}</li>
            </ul>
            {buttons.length > 0 && (
              <div className="email-buttons">
                {buttons.map((button, index) => (
                  <a key={index} href={button.url} className="email-button">
                    {button.text}
                  </a>
                ))}
              </div>
            )}
            <p>
              {t("family.invitationSent.questions", {
                senderName: data.senderName,
              })}
            </p>
            <p>
              <em>{t("family.invitationSent.honor")}</em>
            </p>
          </div>
        );

      default:
        return <div>Email template not found</div>;
    }
  };

  return (
    <div className="email-template">
      <header className="email-header">
        <p>
          {data.userName
            ? t("emails:common.greeting", { name: data.userName })
            : t("emails:ui.greetingDefault")}
        </p>
      </header>

      <main className="email-main">{renderTemplate()}</main>

      <footer className="email-footer">
        <p>{t("ui.closing")}</p>
        <p>{t("ui.signature")}</p>
        <p>{t("ui.footerTagline")}</p>
        <hr />
        <p>
          <small>{t("ui.confidentialNotice")}</small>
        </p>
        <p>
          <small>{t("ui.securityReminder")}</small>
        </p>
        <p>
          <small>{t("ui.contactUs")}</small>
        </p>
        <p>
          <small>
            {t("ui.supportEmail")} | {t("ui.supportPhone")}
          </small>
        </p>
        <p>
          <small>
            {t("ui.unsubscribe")}{" "}
            <a href="#unsubscribe">{t("ui.unsubscribeLink")}</a>
          </small>
        </p>
      </footer>
    </div>
  );
};

export default EmailTemplate;
