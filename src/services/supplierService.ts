import { Hotel } from '../types/hotel';
import { supplierAData, supplierBData, mumbaiData, bangaloreData } from '../data/supplierData';

export class SupplierService {
  private getDataForCity(city: string): { supplierA: Hotel[]; supplierB: Hotel[] } {
    const normalizedCity = city.toLowerCase();
    
    switch (normalizedCity) {
      case 'delhi':
        return { supplierA: supplierAData, supplierB: supplierBData };
      case 'mumbai':
        return { supplierA: mumbaiData, supplierB: mumbaiData };
      case 'bangalore':
        return { supplierA: bangaloreData, supplierB: bangaloreData };
      default:
        return { supplierA: [], supplierB: [] };
    }
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
