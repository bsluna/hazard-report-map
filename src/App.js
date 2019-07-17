import React, { useState, useEffect } from 'react';

import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, LayersControl, ZoomControl, withLeaflet } from 'react-leaflet';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
  Col, Row, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import 'react-leaflet-markercluster/dist/styles.min.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import DataTable from 'react-data-table-component';

import { ReactLeafletSearch } from 'react-leaflet-search';

import Control from 'react-leaflet-control';

import firebase from "firebase";

import './App.css';
import 'react-leaflet-search/src/react-leaflet-search.css';

import { popupContent, popupHead, popupSubHead, popupText } from "./popupStyles";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyD007QLEPXXAyyUhR670glSifJKJRQp9Kw",
  authDomain: "hazard-report-map.firebaseapp.com",
  databaseURL: "https://hazard-report-map.firebaseio.com",
  projectId: "hazard-report-map",
  storageBucket: "",
  messagingSenderId: "398213408056",
  appId: "1:398213408056:web:404a81ab2376712e"  
});

const db = firebaseApp.firestore();

var TyphoonIcon = L.icon({
  iconUrl: '/markers/marker_amber.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var DroughtIcon = L.icon({
  iconUrl: '/markers/marker_blue.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var ElNiñoIcon = L.icon({
  iconUrl: '/markers/marker_bluegrey.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var LaNiñaIcon = L.icon({
  iconUrl: '/markers/marker_brown.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var EarthquakeIcon = L.icon({
  iconUrl: '/markers/marker_deeporange.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var LandslideIcon = L.icon({
  iconUrl: '/markers/marker_deeppurple.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var TsunamiIcon = L.icon({
  iconUrl: '/markers/marker_teal.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var VolcanicHazardIcon = L.icon({
  iconUrl: '/markers/marker_pink.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var PestInfestationIcon = L.icon({
  iconUrl: '/markers/marker_lime.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var SaraiAdvisoryIcon = L.icon({
  iconUrl: '/markers/marker_lightgreen.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})
var SaraiCommunityIcon = L.icon({
  iconUrl: '/markers/marker_green.png',
  iconSize: [29, 35],
  iconAnchor: [14.5, 35],
  popupAnchor: [0, -20]
})

const columns = [
  {
    name: 'Type',
    selector: 'type',
    sortable: false,
  },
  {
    name: 'Location',
    selector: 'latLng.lat',
    sortable: false,
  },
  {
    name: 'Description',
    selector: 'details',
    sortable: false,
  },
  {
    name: 'Date',
    selector: 'datetime',
    sortable: true,
  }
];

const SearchComponent = withLeaflet(ReactLeafletSearch)

function App() {
  const [hazardData, setHazardData] = useState([]);
  const [modal, toggleModal] = useState(false);
  const [modalMarker, setModalMarker] = useState({});
  const [modalType, setModalType] = useState();
  const [modalAdd, toggleModalAdd] = useState(false);

  const[formState, setFormState] = useState(
    { latLng: { lat: 17.9142, lng: 121.9473 },
      loction: "",
      datetime: "",
      status: "unresolved",
      details: "",
      image: "",
      id: 0,
  });
  
  useEffect(() => {
    var docRef = db.collection("reports").doc("hazardData");
    docRef.get().then(function(doc) {
        if (doc.exists) {
            //console.log("Document data:", doc.data().hazardData);
            setHazardData(doc.data().hazardData);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
  }, [])

  const [isOpen, toggleIsOpen] = useState(false);

  const createClusterCustomIcon = function (cluster) {
    var type = cluster._group.options.type;
    return L.divIcon({
      html: `<span class="marker-cluster-custom-span">${cluster.getChildCount()}</span>`,
      className: 'marker-cluster-custom-' + type,
      iconSize: L.point(29, 35, true),
    });
  }

  const addDetails = function (type, marker) {
    if(type === "Typhoon"){
      return(<>
        <span style={popupHead}>{marker.name}</span>
        <br></br>
        <span style={popupSubHead}>Signal No. {marker.signal}</span>
      </>)
    }else if(type === "Drought" || type === "Landslide" || type === "Tsunami" || type === "Volcanic Hazard" || type === "Sarai Advisory" || type === "Sarai Community"){
      return(<>
        <span style={popupHead}>{type}</span>
        <br></br>
        <span style={popupSubHead}>{marker.type}</span>
      </>)
    }else if(type === "Earthquake"){
      return(<>
        <span style={popupHead}>{type}</span>
        <br></br>
        <span style={popupSubHead}>Intensity {marker.intensity}</span>
      </>)
    }else{
      return(<>
        <span style={popupHead}>{type}</span>
      </>)
    }
  }

  const makeModal = function (type, marker) {
    if(marker.id == 20){
      window.open("https://sarai-community.net/2018/11/14/typhoon-lando-damage-assessment/");
    }else if(marker.id === 21){
      window.open("https://sarai-community.net/2018/11/16/typhoon-ompong/");
    }else if(marker.id >= 18){
      setModalMarker(marker);
      setModalType(type);
      toggleModal(!modal);
    }
  }

  return (
    <div className="App">
      <Navbar className="header shadow-sm" color="white" light expand="md">
        <NavbarBrand className="logo-left" href="">
          <img src="header_green.png" alt="sarai logo" height="50" width="363.08"></img>
        </NavbarBrand>
        <NavbarToggler onClick={() => isOpen ? toggleIsOpen(false) : toggleIsOpen(true)} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem> 
              <NavLink href="http://sarai.ph/about-us">About Us</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="https://sarai-community.net/">Sarai Community</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Crops
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>Rice</DropdownItem><DropdownItem>Corn</DropdownItem>
                <DropdownItem>Banana</DropdownItem><DropdownItem>Coconut</DropdownItem>
                <DropdownItem>Coffee</DropdownItem><DropdownItem>Cacao</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Maps
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>Suitability Maps</DropdownItem><DropdownItem>Normalized Difference Vegetation Index</DropdownItem>
                <DropdownItem>Rainfall Map</DropdownItem><DropdownItem>SVTR Map</DropdownItem>
                <DropdownItem>Enhanced Vegetation Index</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Services
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>Rainfall Outlook</DropdownItem><DropdownItem>Suitability</DropdownItem>
                <DropdownItem>Drought Forest</DropdownItem><DropdownItem>Weather Monitoring</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem className="logo-right">
              <img src="dost-pcaarrd-uplb.png" alt="dost-pcaard-uplb logo" height="50" width="153.52"></img>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    
      <Map className="map" center={[12.1648,122.2413]} zoom={6} minZoom={5} maxZoom={19} zoomControl={false} onClick={(e) => console.log(e.latlng)}>
        <Control position="topleft">
          {/* <Button id="hrm-logo" size="sm" color="secondary"><h5>Hazard<br></br>Report Map</h5></Button> */}
          <img className="hrm-logo" src="hrm-logo.png" alt="hazard report map logo" height="65px"></img>
        </Control>
        <ZoomControl position="bottomright" />
        
        {/* <Control position="topright">
          <Button size="sm" id="add-report" color="secondary" onClick={() => toggleModalAdd(!modalAdd)}><h4>+</h4></Button>
        </Control> */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="OpenStreetMap.Mapnik">
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="CartoDB.Positron">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Esri.WorldImagery">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
            />
          </LayersControl.BaseLayer>

          {hazardData.map(hazard => (
            <LayersControl.Overlay checked name={'&nbsp&nbsp&nbsp&nbsp&nbsp'+hazard.type}>
              <MarkerClusterGroup showCoverageOnHover={false} type={hazard.type.replace(/\s/g,'')} iconCreateFunction={createClusterCustomIcon}>
                {hazard.markers.map(marker => (
                  <>
                  <Marker position={marker.latLng} icon={eval((hazard.type.replace(/\s/g,''))+"Icon")}>
                    <Popup className="request-popup">
                      <div className="flex-container" style={popupContent}>
                        <div className="container">
                          <img className="marker-image" src={"/icons/"+hazard.type+".png"} alt={hazard.type+" icon"}></img>
                          <Button className="middle" color="success" size="sm" onClick={() => makeModal(hazard.type, marker)}><h4>+</h4></Button>
                        </div>
                        <div>
                          {addDetails(hazard.type, marker)}
                          <br></br>
                          <span style={popupText}>
                            {/* {marker.latLng.lat+", "+marker.latLng.lng}<br></br> */}
                            {marker.location}<br></br>
                            <br></br>
                            <sub>{marker.datetime}</sub>
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  </>
                ))}
              </MarkerClusterGroup>
            </LayersControl.Overlay>
          ))}

        </LayersControl>
        <SearchComponent 
          position="topright"
          inputPlaceholder="Search"
          closeResultsOnClick={true} 
          searchBounds={[[4.21580632, 126.80725617],[21.32178056, 114.09521446]]}
        />
      </Map>

      <Modal isOpen={modal} size="lg" toggle={() => toggleModal(!modal)}>
        {/* <ModalHeader toggle={() => toggleModal(!modal)}></ModalHeader> */}
        <img className="center" src={"/details/"+modalMarker.id+".png"} alt={modalMarker.id}></img>
        {/* <ModalBody> */}
          
        {/* </ModalBody> */}
        <ModalFooter>
          {/* <Button color="primary" onClick={() => toggleModal(!modal)}>Do Something</Button>{' '} */}
          <Button color="success" onClick={() => toggleModal(!modal)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* <Modal isOpen={modalAdd} size="lg" toggle={() => toggleModalAdd(!modalAdd)}>
        <ModalHeader toggle={() => toggleModalAdd(!modalAdd)}>Add Report</ModalHeader>
        <ModalBody>
        <Form>
          <Row form>
            <Col md={5}>
              <FormGroup>
                <Label for="form-type">Type</Label>
                <Input onChange={(e)=>console.log(e.target.value)} type="select" name="form-type" id="form-type">
                  <option>Typhoon</option>
                  <option>Drought </option>
                  <option>El Niño</option>
                  <option>La Niña</option>
                  <option>Earthquake</option>
                  <option>Landslide</option>
                  <option>Tsunami</option>
                  <option>Volcanic Hazard</option>
                  <option>Pest Infestation</option>
                  <option>Sarai Advisory</option>
                  <option>Sarai Community</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="form-location">Location</Label>
                <Input
                  onChange={(e)=>console.log(e.target.value)}
                  type="text"
                  name="form-location"
                  id="form-location"
                  placeholder="Municipality, Province"
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="form-datetime">Date</Label>
                <Input
                  onChange={(e)=>console.log(e.target.value)}
                  type="date"
                  name="form-datetime"
                  id="form-datetime"
                  placeholder=""
                />
              </FormGroup>
            </Col>
          </Row>
          {addFormDetails(form-type)}
        </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => toggleModalAdd(!modalAdd)}>Close</Button>
        </ModalFooter>
      </Modal> */}
      
      {/* <DataTable
        columns={columns}
        data={hazardData[0].markers}
      /> */}
    </div>
  );
}

export default App;
