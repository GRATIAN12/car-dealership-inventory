import { Vehicle } from './vehicle';

describe('Vehicle Model', () => {
  it('should correctly initialize a vehicle with all required properties', () => {
    // Attempting to create a new vehicle based on the core project requirements
    const myCar = new Vehicle('v-123', 'Toyota', 'Camry', 'Sedan', 25000, 5);
    
    expect(myCar.id).toBe('v-123');
    expect(myCar.make).toBe('Toyota');
    expect(myCar.model).toBe('Camry');
    expect(myCar.category).toBe('Sedan');
    expect(myCar.price).toBe(25000);
    expect(myCar.quantity).toBe(5);
  });
});