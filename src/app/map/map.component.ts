import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BubbleService} from '../bubble.service';
import * as L from 'leaflet';
import "leaflet/dist/images/marker-shadow.png";
import 'src/assets/myjs/BubbleLayer.js';
import * as d3_scale from 'd3/dist/d3.min.js';
import * as chroma from 'chroma-js/docs/libs/chroma.min.js';
import * as numeral from 'numeral/numeral.js';




@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit,AfterViewInit {

  public map;
  public states;
  private bubbles;
  fill: any;

  constructor(private service: BubbleService) {
  }

  ngOnInit(): void {
    this.initMap();
  }

  ngAfterViewInit() {
    this.service.getShapes().subscribe(data => {
      this.states = data;
      console.log(this.states);
      this.addBubbles();
      this.addLegend();

    });
  }


  initMap(): void {

    this.map = L.map('map').setView([36.65079252503468, -119.15771484375], 6);

    const tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    });

    tiles.addTo(this.map);

  }

  addBubbles() {
    console.log("addBubbles:", this.states);
     this.bubbles = L.bubbleLayer(this.states, {
      property: 'population',
      legend: false,
      max_radius: 40,
      scale: 'YlGn',
      tooltip: true,
    });
    this.bubbles.addTo(this.map);
  }
  getMax(){
    let max = 0;
    const features = this.states.features;
    const property = this.bubbles.options.property;
    for (let i=0; i< features.length; i++){
      if(features[i].properties[property] > max){
        max = features[i].properties[property];
      }
    }
    return max;
  }

  addLegend(){
    console.log(this.bubbles, 'bubblessss');
    const legend = new L.Control({ position: 'bottomright' });
    const max_radius = this.bubbles.options.max_radius;
    const opacity = this.bubbles.options.style.opacity;
    const max = this.getMax();
    const normal = d3_scale.scaleLinear()
      .domain([0, max])
      .range([0, 1]);
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      console.log(div);
      div.innerHTML += '<strong>' + this.bubbles.options.property + '</strong><br/>';
      div.style = 'background-color: #FFF; padding: 8px; font-size: 14px; text-transform: capitalize'
      for (let i = 3; i > 0; i--) {
        const minArea = Math.PI * 3 * 3;
        const maxArea = Math.PI * this.bubbles.options.max_radius * this.bubbles.options.max_radius;
        const scale = d3_scale.scaleLinear()
          .domain([0, max])
          .range([minArea, maxArea]);
        const area =scale(max / i / 2);
        const radius = Math.sqrt(area / Math.PI)
        let item = L.DomUtil.create('div', 'bubble');
        if (this.bubbles.options.scale) {
          const fillScale = chroma.scale(this.bubbles.options.scale);
          if (fillScale) {
            this.fill = fillScale(normal(max / i))
          }
        }
        item.innerHTML = '<svg height="' + (max_radius * 2) + '" width="' + (max_radius * 2 - (max_radius / 2)) + '">' +
          '<circle cx="' + (radius + 1) + '" cy="' + max_radius + '" r="' + radius + '" stroke="' + chroma(this.fill).darken().hex() + '" stroke-width="1" opacity="' + opacity + '" fill="' + this.fill + '" />' +
          '<text font-size="11" text-anchor="middle" x="' + (radius) + '" y="' + (max_radius * 2) + '" fill="#AAA">' + numeral(max / i).format('0 a'); + '</text>' +
        '</svg>';

        item.style = 'float:left; width: ' + radius + ';'
        div.appendChild(item)
      }
      return div;
    }
    legend.addTo(this.map);


  }

}
