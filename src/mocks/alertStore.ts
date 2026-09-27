import { ALERT_CHANNELS, ALERT_EVENTS, ALERT_RULES } from "./alerts";
import { createCollectionStore } from "./collectionStore";

export const alertRuleStore = createCollectionStore(ALERT_RULES);
export const alertChannelStore = createCollectionStore(ALERT_CHANNELS);
export const alertEventStore = createCollectionStore(ALERT_EVENTS);
