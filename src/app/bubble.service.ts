import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BubbleService {

  capitals: string = '../assets/data/ca-cities.geojson';
  //capitals: string ='assets/data/usa-states.geojson';

  constructor(private http: HttpClient) { }

  public getShapes(): Observable<any>{
    return this.http.get(this.capitals);
  }

}
