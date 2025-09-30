import { Hotel } from '../types/hotel';
import { supplierAData, supplierBData } from '../data/supplierData';

export class SupplierService {
  private getDataForCity(city: string): { supplierA: Hotel[]; supplierB: Hotel[] } {
    const normalizedCity = city.toLowerCase();
    const supplierA = supplierAData.filter(h => h.city.toLowerCase() === normalizedCity);
    const supplierB = supplierBData.filter(h => h.city.toLowerCase() === normalizedCity);
    return { supplierA, supplierB };
  }

  async getSupplierAHotels(city: string): Promise<Hotel[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    const { supplierA } = this.getDataForCity(city);
    return supplierA;
  }

  async getSupplierBHotels(city: string): Promise<Hotel[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    const { supplierB } = this.getDataForCity(city);
    return supplierB;
  }

  async checkSupplierHealth(supplier: 'A' | 'B'): Promise<boolean> {
    // Simulate health check with occasional failures
    const random = Math.random();
    return random > 0.1; // 90% success rate
  }
}
