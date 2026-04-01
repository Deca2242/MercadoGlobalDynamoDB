import { Router } from "express";
import { UserController } from "../controllers/UserController";

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.post("/", controller.createProfile);
  router.get("/:userId/profile", controller.getProfile);
  router.get("/:userId/dashboard", controller.getDashboard);

  router.get("/:userId/addresses", controller.listAddresses);
  router.post("/:userId/addresses", controller.addAddress);
  router.delete("/:userId/addresses/:addressId", controller.deleteAddress);

  router.get("/:userId/payments", controller.listPayments);
  router.post("/:userId/payments", controller.addPayment);
  router.delete("/:userId/payments/:paymentId", controller.deletePayment);

  router.get("/:userId/orders", controller.listOrders);

  return router;
}
