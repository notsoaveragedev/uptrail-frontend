import { createCollectionStore } from "./collectionStore";
import { STATUS_PAGES, STATUS_SUBSCRIBERS } from "./statusPages";

export const statusPageStore = createCollectionStore(STATUS_PAGES);
export const statusSubscriberStore = createCollectionStore(STATUS_SUBSCRIBERS);
