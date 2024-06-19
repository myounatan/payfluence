import * as yup from 'yup';

// Ping data

const PingSchema = yup.object({
  webhookId: yup.string().uuid().required(),
  message: yup.string().required(),
  events: yup.array().of(yup.string()).required(),
  url: yup.string().required(),
  isEnabled: yup.boolean().required(),
});

// User created data (make everything optional except id (aka do not add required)

const UserCreatedSchema = yup.object({
  missingFields: yup.array().of(yup.string()),
  lastVerifiedCredentialId: yup.string().uuid(),
  metadata: yup.object(),
  mfaBackupCodeAcknowledgement: yup.mixed().nullable(),
  lastVisit: yup.date(),
  sessionId: yup.string().uuid(),
  projectEnvironmentId: yup.string().uuid(),
  lists: yup.array().of(yup.string()),
  newUser: yup.boolean(),
  verifiedCredentials: yup.array().of(
    yup.object({
      format: yup.string(),
      id: yup.string().uuid(),
      publicIdentifier: yup.string().email(),
      email: yup.string().email(),
    })
  ),
  id: yup.string().uuid(),
  firstVisit: yup.date(),
  email: yup.string().email(),
});

// General payload for webhook

export const WebhookSchema = yup.object({
  eventId: yup.string().uuid().required(),
  webhookId: yup.string().uuid().required(),
  environmentId: yup.string().uuid().required(),
  data: yup.mixed().test('is-valid-data', 'Invalid data', value => {
    try {
      UserCreatedSchema.validateSync(value);
      return true;
    } catch (error) {
      try {
        PingSchema.validateSync(value);
        return true;
      } catch (error) {
        return false;
      }
    }
  }).required(),
  environmentName: yup.string().required(),
  messageId: yup.string().uuid().required(),
  eventName: yup.string().required(),
  timestamp: yup.date().required(),
});
