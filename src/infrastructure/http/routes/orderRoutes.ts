import { Router } from "express";
import { OrderController } from "../controllers/OrderController";

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();

  router.post("/", controller.createOrder);
  router.get("/:orderId", controller.getHeader);
  router.get("/:orderId/items", controller.listItems);
  router.get("/:orderId/detail", controller.getFullDetail);
  router.patch("/:orderId/status", controller.updateStatus);

  return router;
}
