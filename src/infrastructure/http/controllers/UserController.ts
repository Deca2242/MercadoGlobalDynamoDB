import { Request, Response } from "express";
import { UserServicePort } from "../../../application/ports/UserServicePort";

export class UserController {
  constructor(private readonly userService: UserServicePort) {}

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const user = await this.userService.getProfile(userId);
    res.json(user);
  };

  createProfile = async (req: Request, res: Response): Promise<void> => {
    const { name, email } = req.body;

    const userId = await this.userService.createProfile(name, email);

    res.status(201).json({ message: "Profile created", userId });
  };

  listAddresses = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const addresses = await this.userService.listAddresses(userId);
    res.json(addresses);
  };

  addAddress = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const { addressId, street, city } = req.body;
    await this.userService.addAddress(userId, addressId, street, city);
    res.status(201).json({ message: "Address added" });
  };

  deleteAddress = async (req: Request, res: Response): Promise<void> => {
    const { userId, addressId } = req.params as {
      userId: string;
      addressId: string;
    };
    await this.userService.deleteAddress(userId, addressId);
    res.status(204).send();
  };

  listPayments = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const payments = await this.userService.listPayments(userId);
    res.json(payments);
  };

  addPayment = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const { paymentId, type, last4 } = req.body;
    await this.userService.addPayment(userId, paymentId, type, last4);
    res.status(201).json({ message: "Payment added" });
  };

  deletePayment = async (req: Request, res: Response): Promise<void> => {
    const { userId, paymentId } = req.params as {
      userId: string;
      paymentId: string;
    };
    await this.userService.deletePayment(userId, paymentId);
    res.status(204).send();
  };

  listOrders = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const status = req.query.status as string | undefined;

    if (status) {
      const orders = await this.userService.filterOrdersByStatus(
        userId,
        status,
      );
      res.json(orders);
      return;
    }

    const orders = await this.userService.listOrders(userId);
    res.json(orders);
  };

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params as { userId: string };
    const dashboard = await this.userService.getDashboard(userId);
    res.json(dashboard);
  };
}
