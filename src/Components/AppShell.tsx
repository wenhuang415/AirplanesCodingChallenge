import { useState } from "react";
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
} from "@mantine/core";

const citiesURL = 'http://javin.dev.usekilo.com:8000/api/cities/?format=json&offset='
const routesURL = 'http://javin.dev.usekilo.com:8000/api/routes/?format=json&offset='

let cityID: Object[]=[];
let cityNames:string[]=[];
let allRoutes: Object[]=[];

document.addEventListener("DOMContentLoaded", () => {
  //get all the city name and cit ids
  function fetchZones(i:number) {
    fetch(citiesURL+i)
      .then((response) => response.json())
      .then((data) => getCities(data))
      .catch(Error);
  }
  function getCities(zones: any) {
    const city=zones.results;
    const keys = Object.keys(zones.results);
    //console.log(keys);
    keys.forEach((key) => {
      //console.log('id: ',city[key].city_id, 'name:', city[key].name)
      let name = city[key].name
      let id = city[key].city_id
      let aCity = {[name]: id}
      cityID.push(aCity)
      cityNames.push(name)
    });
  }

  //fetch all 4 pages for cities
  for(let i = 0; i < 5; i++) {
    fetchZones(i*100)
  }

});

//get routes
function getRoutes(i:number) {
      fetch(routesURL+i)
      .then((response) => response.json())
      .then((data) => processRoutes(data))
      .catch(Error);
  }

function processRoutes(routes:any) {
    //console.log(routes.results);
    const keys = Object.keys(routes.results);
    keys.forEach((key) => {
      let aRoute = routes.results[key]
      allRoutes.push(aRoute)
    });
  }

  //get a few routes routes only, not enough resources to get all, maybe use multithreading??
  for(let i = 0; i < 5; i++) {
    getRoutes(i*100)
  }

  //have to match city id of origin and destination in routes then display to user...

console.log(cityID)

export default function AppShellDemo() {
  const rows =''
  const theme = useMantineTheme();
  theme.colorScheme = "dark";
  const [opened, setOpened] = useState(false);
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
                <Autocomplete id="origin"
      label="Origin"
      placeholder="Pick one"
      data = {cityNames}
    />
                <Autocomplete id='destination'
      label="Destination"
      placeholder="Pick one"
      data={cityNames}
    />
        </Navbar>
      }
      aside={
        <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
          <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
            <Text>Airlines</Text>
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

          <Table>
      <thead>
        <tr>
          <th>Route_ID</th>
          <th>Cost</th>
          <th>Distance</th>
          <th>Aircraft</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
         <Text>{JSON.stringify(allRoutes)}</Text>

      
    </AppShell>
  );
}
