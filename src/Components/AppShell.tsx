import { useState } from "react";
import { useInputState } from "@mantine/hooks";
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Aside,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Autocomplete,
  Table,
  Button,
} from "@mantine/core";

const citiesURL =
  "http://javin.dev.usekilo.com:8000/api/cities/?format=json&offset=";
const routesURL = "http://javin.dev.usekilo.com:8000/api/routes/?format=json";
const airlineURL =
  "http://javin.dev.usekilo.com:8000/api/airlines/?format=json";

const airplaneURL =
  "http://javin.dev.usekilo.com:8000/api/aircraft/?format=json&offset=";


let cities: city[] = [];
let cityNames: string[] = [];
let airplanes: plane[] = [];
let airlines: airline[] = [];

interface city {
  city_id: string;
  city_number: number;
  county: string;
  name: string;
  shape_area: number;
  shape_length: number;
  latitude: number;
  longitude: number;
}

interface plane {
  aircraft_id: string;
  airline: string;
  name: string;
  speed: number;
}

interface airline {
  airline_id: string;
  name: string;
}

interface route {
  route_id: string;
  cost: number;
  distance: number;
  origin: string;
  aircraft: string;
  destination: string;
}

document.addEventListener("DOMContentLoaded", async () => {
  //get all the city name and city ids
  async function fetchZones(i: number) {
    await fetch(citiesURL + i)
      .then((response) => response.json())
      .then((data) => getCities(data))
      .catch(Error);
  }

  function getCities(zones: any) {
    const cityList = zones.results;
    //console.log(cityList)
    for(let aCity of cityList) {
      //console.log(aCity)
      cities.push(aCity)
      cityNames.push(aCity.name)
      //cityID.push(aCity.city_id)
    }
  }

  //fetch all 4 pages for cities
  for (let i = 0; i < 5; i++) {
    fetchZones(i * 100);
  }
  
  async function fetchAircraft(i: number) {
    await fetch(airplaneURL + i)
      .then((response) => response.json())
      .then((data) => addAircraft(data))
      .catch(Error);
  }

  function addAircraft(aircraft: any) {
    airplanes.push(aircraft.results);
    const keys = Object.keys(aircraft.results);
    keys.forEach((key) => {
      airplanes.push(aircraft.results[key]);
    });
  }

  for (let i = 0; i < 28; i++) {
    fetchAircraft(i);
  }

  async function fetchAirline() {
    await fetch(airlineURL)
      .then((response) => response.json())
      .then((data) => addAirline(data))
      .catch(Error);
  }

  function addAirline(airline: any) {
    //const dom = document.querySelector("#airline");
    const airlineObj = airline.results;
    for (let airline of airlineObj) {
      airlines.push(airline);
    }
  }
  fetchAirline();
  //console.log(airlines)
});

function craftToLine(craft: string): string {
  let line = "";
  airplanes.forEach((plane) => {
    if (craft == plane.aircraft_id) line = plane.airline;
  });
  return line;
}

function lineToName(line: string): string {
  let name = "";
  airlines.forEach((aLine) => {
    if (aLine.airline_id == line) name = aLine.name;
  });
  return name;
}

function getCityID(name: any): string {
  let ret = "";
  for(let aCity of cities) {
    if(aCity.name.toLocaleLowerCase() === name) ret = aCity.city_id
  }
  return ret;
}

function getCityName(id: string): string {
  let ret =''
  for(let aCity of cities) {
    if(aCity.city_id === id) ret=aCity.name
  }
  return ret;
}

function craftIDtoName(id: string): string {
  let name = "";
  for (let plane of airplanes) {
    if (plane.aircraft_id == id) name = plane.name;
  }
  return name;
}

async function fetchRoutes(
  cost: string = "",
  distance: string = "",
  origin: string = "",
  destination: string = "",
  aircraft: string = ""
) {
  //console.log("origin: ", origin);
  //console.log("getCityID: ", getCityID(origin));
  cost = "&cost=" + cost;
  distance = "&distance=" + distance;
  let originID = "&origin=" + getCityID(origin);
  //console.log("originID: ", originID);
  let destinationID = "&destination=" + getCityID(destination);
  aircraft = "&aircraft=" + aircraft;
  const fullURL =
    routesURL + cost + distance + originID + destinationID + aircraft;
  //console.log("routeURL: ", fullURL);
  await fetch(fullURL)
    .then((response) => response.json())
    .then((data) => addRoutes(data))
    .catch(Error);
}

function addRoutes(routes: any) {
  const tbody = document.querySelector("#tbody");
  if (tbody !== null) {
    tbody.innerHTML = "";
    const routesObj = routes.results;
    routesObj.forEach((aRoute: route) => {
      const tr = document.createElement("tr");
      const tdID = document.createElement("td");
      tdID.innerHTML = aRoute.route_id;
      const tdCost = document.createElement("td");
      tdCost.innerHTML = aRoute.cost.toString();
      const tdDistance = document.createElement("td");
      tdDistance.innerHTML = aRoute.distance.toString();
      const tdAircraft = document.createElement("td");
      //convert airplane id to name
      tdAircraft.innerHTML = craftIDtoName(aRoute.aircraft);
      const tdLine = document.createElement("td");
      //convert aircraft ID to airline ID
      let airlineID = craftToLine(aRoute.aircraft);
      //conver airline ID to airline name
      let airlineName = lineToName(airlineID);
      tdLine.innerHTML = airlineName;

      const tdFrom = document.createElement("td");
      tdFrom.innerHTML = getCityName(aRoute.origin) 

      const tdTo = document.createElement("td")
      tdTo.innerHTML = getCityName(aRoute.destination)


      tr.appendChild(tdID);
      tr.appendChild(tdCost);
      tr.appendChild(tdDistance);
      tr.appendChild(tdAircraft);
      tr.appendChild(tdLine);
      tr.appendChild(tdFrom);
      tr.appendChild(tdTo);
      tbody?.appendChild(tr);
    });
  }
}

interface memo{
  [key: string]: route[]
}



function getAllRoutes(origin: string = "", destination: string = "", Amemo:memo={}) {
  //base case
  //console.log(Amemo)
  Amemo = Amemo || {}
  if(origin in Amemo) return Amemo[origin as keyof memo];
  if (origin === destination) return [];
  let originID = "&origin=" + getCityID(origin);
  //let destinationID = "&destination="+ getCityID(destination)
  //console.log(destination, destinationID)
  const fullURL = routesURL + originID;
  //console.log('fullURL: ', fullURL)
  let routesCombo:route[] = []
  
  fetch(fullURL)
    .then((response) => response.json())
    .then((data) => {
      for(let aRoute of data.results) {
        //console.log(aRoute)
        let moreRoutes = getAllRoutes(getCityName(aRoute.destination) , destination, Amemo);
        routesCombo.push(aRoute)
      }

    });
  Amemo[origin as keyof memo] = routesCombo;
  return routesCombo;
}

// setTimeout(function () {
//   console.log(getAllRoutes("adelanto", "chino"));
//   //console.log(cities);
// }, 2000);

export default function AppShellDemo() {
  const theme = useMantineTheme();
  theme.colorScheme = "dark";
  const [opened, setOpened] = useState(false);
  const [cost, setCost] = useInputState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, seetDistance] = useInputState("");
  const [aircraft, setAircraft] = useInputState("");
  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          <Text>Cities</Text>
          <Autocomplete
            value={origin}
            onChange={setOrigin}
            label="Origin"
            placeholder="Pick one"
            data={cityNames}
          />
          <Autocomplete
            id="destination"
            label="Destination"
            placeholder="Pick one"
            value={destination}
            onChange={setDestination}
            data={cityNames}
          />
          <>
            <input
              type="text"
              placeholder="cost"
              value={cost}
              onChange={setCost}
            />
            <input
              type="text"
              placeholder="distance"
              value={distance}
              onChange={seetDistance}
            />
          </>
          <Button
            style={{ padding: "1" }}
            onClick={() =>
              fetchRoutes(cost, distance, origin, destination, aircraft)
            }
          >
            Submit
          </Button>
        </Navbar>
      }
      aside={
        <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
          <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
            <Text>Layovers</Text>
          </Aside>
        </MediaQuery>
      }
      footer={
        <Footer height={60} p="md">
          codyhuang415@gmail.com
        </Footer>
      }
      header={
        <Header height={70} p="md">
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>
            <Text>Cody Huang</Text>
          </div>
        </Header>
      }
    >
      <Table id="routesTable">
        <thead>
          <tr>
            <th id="routeID">RouteID</th>
            <th id="costID">Cost</th>
            <th id="distanceID">Distance</th>
            <th id="aircraftID">Aircraft</th>
            <th id="airlineID">Airline</th>
            <th>From</th>
            <th>To</th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </Table>
    </AppShell>
  );
}
