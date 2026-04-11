import { Request, Response } from "express";
import { OrderService } from "../../../application/services/OrderService";

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  getHeader = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params as { orderId: string };
    const order = await this.orderService.getHeader(orderId);
    res.json(order);
  };

  listItems = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params as { orderId: string };
    const items = await this.orderService.listItems(orderId);
    res.json(items);
  };

  getFullDetail = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params as { orderId: string };
    const detail = await this.orderService.getFullDetail(orderId);
    res.json(detail);
  };

  createOrder = async (req: Request, res: Response): Promise<void> => {
    const { order, items } = req.body;
    await this.orderService.createOrder(order, items);
    res.status(201).json({ message: "Order created" });
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params as { orderId: string };
    const { newStatus } = req.body;
    await this.orderService.updateStatus(orderId, newStatus);
    res.json({ message: "Status updated" });
  };
}
