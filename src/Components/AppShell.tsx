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
  keyframes,
} from "@mantine/core";

const citiesURL =
  "http://javin.dev.usekilo.com:8000/api/cities/?format=json&offset=";
const routesURL = "http://javin.dev.usekilo.com:8000/api/routes/?format=json";
const airlineURL =
  "http://javin.dev.usekilo.com:8000/api/airlines/?format=json";

let cityID: Object[] = [];
let cityNames: string[] = [];

document.addEventListener("DOMContentLoaded", async () => {
  //get all the city name and city ids
  async function fetchZones(i: number) {
    await fetch(citiesURL + i)
      .then((response) => response.json())
      .then((data) => getCities(data))
      .catch(Error);
  }

  function getCities(zones: any) {
    const city = zones.results;
    const keys = Object.keys(zones.results);
    //console.log(keys);
    keys.forEach((key) => {
      //console.log('id: ',city[key].city_id, 'name:', city[key].name)
      let name = city[key].name.toLowerCase();
      let id = city[key].city_id;
      let aCity = { [name]: id };
      cityID.push(aCity);
      cityNames.push(name);
    });
  }

  //fetch all 4 pages for cities
  for (let i = 0; i < 5; i++) {
    fetchZones(i * 100);
  }

  async function fetchAirline() {
    await fetch(airlineURL)
      .then((response) => response.json())
      .then((data) => addAirline(data))
      .catch(Error);
  }

  function addAirline(airline: any) {
    const dom = document.querySelector("#airline");
    const airlineObj = airline.results;
    const keys = Object.keys(airlineObj);
    //console.log(keys)
    keys.forEach((key) => {
      const text = document.createElement("Text");
      //console.log(airlineObj[key].name)
      const airlineName = airlineObj[key].name;
      text.innerHTML = JSON.stringify(airlineName);
      dom?.append(text);
    });
  }
  fetchAirline();
});

function getCityID(name: any) :string {
  let ret = ''
  const keys = Object.keys(cityID);
  keys.forEach((key: any) => {
    const city = cityID[key];
    const cityObj = Object.keys(city);
    const cityName = cityObj[0];
    if (cityName == name) {
      const id: string = city[cityName as keyof typeof city].toString(); //this line took an hour to figure out
      console.log(cityName);
      console.log(id);
      ret = id;
    }
  });
  return ret;
}

async function fetchRoutes(
  cost: string = "",
  distance: string = "",
  origin: string = "",
  destination: string = "",
  aircraft: string = ""
) {
  console.log("origin: ", origin);
  console.log("getCityID: ", getCityID(origin));
  cost = "&cost=" + cost;
  distance = "&distance=" + distance;
  let originID = "&origin=" + getCityID(origin);
  console.log("originID: ", originID);
  let destinationID = "&destination=" + getCityID(destination);
  aircraft = "&aircraft=" + aircraft;
  const fullURL =
    routesURL + cost + distance + originID + destinationID + aircraft;
  console.log("routeURL: ", fullURL);
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
    const keys = Object.keys(routesObj);
    keys.forEach((key) => {
      const tr = document.createElement("tr");
      const tdID = document.createElement("td");
      tdID.innerHTML = routesObj[key].route_id;
      const tdCost = document.createElement("td");
      tdCost.innerHTML = routesObj[key].cost;
      const tdDistance = document.createElement("td");
      tdDistance.innerHTML = routesObj[key].distance;
      const tdAircraft = document.createElement("td");
      tdAircraft.innerHTML = routesObj[key].aircraft;

      tr.appendChild(tdID);
      tr.appendChild(tdCost);
      tr.appendChild(tdDistance);
      tr.appendChild(tdAircraft);
      tbody?.appendChild(tr);
    });
  }
}

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
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </Table>
    </AppShell>
  );
}
