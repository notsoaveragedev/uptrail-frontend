import { createCollectionStore } from "./collectionStore";
import { DASHBOARD_SEEDS } from "./dashboards";

export const dashboardStore = createCollectionStore(DASHBOARD_SEEDS);
