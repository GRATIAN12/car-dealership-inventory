export class Vehicle {
  public id: string;
  public make: string;
  public model: string;
  public category: string;
  public price: number;
  public quantity: number;

  constructor(
    id: string,
    make: string,
    model: string,
    category: string,
    price: number,
    quantity: number
  ) {
    this.id = id;
    this.make = make;
    this.model = model;
    this.category = category;
    this.price = price;
    this.quantity = quantity;
  }
}