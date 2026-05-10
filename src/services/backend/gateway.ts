import { ExpressAuthProvider } from "./providers/expressAuthProvider";
import { ExpressCatalogEventsProvider } from "./providers/expressCatalogEventsProvider";
import { ExpressEventsProvider } from "./providers/expressEventsProvider";
import { ExpressPaymentsProvider } from "./providers/expressPaymentsProvider";
import { ExpressTicketsProvider } from "./providers/expressTicketsProvider";
import type { BackendGateway } from "./types";

export const backendGateway: BackendGateway = {
  mode: "express",
  auth: new ExpressAuthProvider(),
  events: new ExpressEventsProvider(),
  catalogEvents: new ExpressCatalogEventsProvider(),
  payments: new ExpressPaymentsProvider(),
  tickets: new ExpressTicketsProvider(),
};
