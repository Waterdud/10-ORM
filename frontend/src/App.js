import { useRef } from 'react';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [customers, setCustomers] = useState([]);
  // Kasutame siinkohal dünaamilist väljakuvamist && abil peitmaks lehekülgede sisu
  // Tegelikult peaks kasutama URL muutusteks ja erineva sisu näitamiseks Reacti moodulit "react-router-dom"
  // Siinkohal on tehtud see sellel eesmärgil, et oleks võimalik ühe copy-paste abil kogu eesrakenduse sisu võtta
  const url = window.location.href.split(window.location.host)[1];
  const firstNameRef = useRef();
  const lastNameRef = useRef();

  useEffect(() => {
      fetch("/customer")
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
          }
          return res.json();
        })
        .then(json => {
          setCustomers(json);
        })
        .catch(error => {
          console.error('Error fetching customers:', error);
          // You might want to show an error message to the user
        });
  }, []);

  function deleteCustomer(index) {
    const id = customers[index].id;
    fetch("/customer/" + id, {method: "DELETE"})
        .then(res => res.json())
        .then(json => {
          setCustomers(json);
    });
  }

  function addCustomer() {
    const newCustomer = {
      "FirstName": firstNameRef.current.value,
      "LastName": lastNameRef.current.value
    }
    fetch("/customer/", {method: "POST", body: JSON.stringify(newCustomer), headers: {"Content-Type": "application/json"}})
        .then(res => res.json())
        .then(json => {
          setCustomers(json);
          firstNameRef.current.value = "";
          lastNameRef.current.value = "";
    });
  }

  // SIIT ALLAPOOLE VÕIKS OLLA ERALDI COMPONENT, aga lihtsuse huvides 
  // (et saaks ühe ülevalt alla copy-paste abil eesrakenduse koodi implementeerida),
  // on kogu React kood ühe faili all.

  const [customerUsages, setCustomerUsages] = useState([]);
  const [customerSum, setCustomerSum] = useState(-1);
  const [usagesShownCustomerId, setUsagesShownCustomerId] = useState(-1);

  function getCustomerUsages(customerId) {
    fetch("/usage/usage-customer?customerId=" + customerId)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return res.text().then(text => {
          console.error('Non-JSON response received:', text);
          throw new Error('Response is not JSON: ' + text.substring(0, 100));
        });
      }
      return res.json();
    })
    .then(json => {
      setCustomerUsages(json);
      setUsagesShownCustomerId(customerId);
      setCustomerSum(-1);
      setAddUsageCustomerId(-1);
    })
    .catch(error => {
      console.error('Error fetching customer usages:', error);
      setCustomerUsages([]);
      setUsagesShownCustomerId(customerId);
    });
  }

  function getCustomerSum() {
    fetch("/usage/usage-customer-sum?customerId=" + usagesShownCustomerId)
    .then(res => res.json())
    .then(json => {
      setCustomerSum(json);
    });
  }

  // SIIT ALLAPOOLE VÕIKS OLLA ERALDI COMPONENT, aga lihtsuse huvides 
  // (et saaks ühe ülevalt alla copy-paste abil eesrakenduse koodi implementeerida),
  // on kogu React kood ühe faili all.

  const startTimeRef = useRef();
  const endTimeRef = useRef();
  const [addUsageCustomerId, setAddUsageCustomerId] = useState(-1);

  function showAddUsage(customerId) {
    setCustomerUsages([]);
    setUsagesShownCustomerId(-1);
    setAddUsageCustomerId(customerId);
  }

  function addUsage() {
    // Validation
    if (deviceSelected === -1 || deviceSelected === "") {
      alert('Palun vali seade');
      return;
    }
    if (!startTimeRef.current.value) {
      alert('Palun sisesta kasutuse algusaeg');
      return;
    }
    if (!endTimeRef.current.value) {
      alert('Palun sisesta kasutuse lõppaeg');
      return;
    }
    
    const startDate = new Date(startTimeRef.current.value);
    const endDate = new Date(endTimeRef.current.value);
    
    if (startDate >= endDate) {
      alert('Algusaeg peab olema varasem kui lõppaeg');
      return;
    }

    const newUsage = {
      "DeviceId": Number(deviceSelected),
      "CustomerId": Number(addUsageCustomerId),
      "Start": startDate.toISOString(),
      "End": endDate.toISOString(),
    }
    console.log('Sending usage data:', newUsage);
    fetch("/usage/", {method: "POST", body: JSON.stringify(newUsage), headers: {"Content-Type": "application/json"}})
        .then(res => {
          console.log('Usage POST response status:', res.status);
          if (!res.ok) {
            return res.text().then(text => {
              console.error('Error response body:', text);
              throw new Error(`HTTP error! status: ${res.status}, body: ${text.substring(0, 200)}`);
            });
          }
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            return res.text().then(text => {
              console.error('Non-JSON response received:', text);
              throw new Error('Response is not JSON: ' + text.substring(0, 100));
            });
          }
          return res.json();
        })
        .then(json => {
          console.log('Usage POST success:', json);
          setAddUsageCustomerId(-1);
          // Clear the form
          startTimeRef.current.value = "";
          endTimeRef.current.value = "";
          setDeviceSelected(-1);
        })
        .catch(error => {
          console.error('Error adding usage:', error);
          alert('Error adding usage: ' + error.message);
        });
  }

  // SIIT ALLAPOOLE VÕIKS OLLA ERALDI COMPONENT, aga lihtsuse huvides 
  // (et saaks ühe ülevalt alla copy-paste abil eesrakenduse koodi implementeerida),
  // on kogu React kood ühe faili all.

  const [devices, setDevices] = useState([]);
  const [deviceSelected, setDeviceSelected] = useState(-1);
  const deviceNameRef = useRef();
  const wattsRef = useRef();

  useEffect(() => {
    fetch("/device")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        setDevices(json);
      })
      .catch(error => {
        console.error('Error fetching devices:', error);
      });
  }, []);

  function deleteDevice() {
    fetch("/device/" + deviceSelected, {method: "DELETE"})
      .then(res => res.json())
      .then(json => {
        setDevices(json);
        setDeviceSelected(-1);
      });
  }

  function selectDevice(e) {
    setDeviceSelected(e.target.value);
  }

  function addDevice() {
    const newDevice = {
      "name": deviceNameRef.current.value,
      "watts": Number(wattsRef.current.value)
    }
    fetch("/device/", {method: "POST", body: JSON.stringify(newDevice), headers: {"Content-Type": "application/json"}})
        .then(res => res.json())
        .then(json => {
          setDevices(json);
          deviceNameRef.current.value = "";
          wattsRef.current.value = "";
    });
  }

  // SIIT ALLAPOOLE VÕIKS OLLA ERALDI COMPONENT, aga lihtsuse huvides 
  // (et saaks ühe ülevalt alla copy-paste abil eesrakenduse koodi implementeerida),
  // on kogu React kood ühe faili all.

  const [usages, setUsages] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const startRef = useRef();
  const endRef = useRef();

  useEffect(() => {
    if (start !== null && end !== null) {
      fetch("/usage/usage-start-period?startDate=" + start + "&endDate=" + end)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(json => {
          console.log(json);
          setUsages(json);
        })
        .catch(error => {
          console.error('Error fetching filtered usages:', error);
        });
    } else {
      fetch("/usage")
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(json => {
          setUsages(json);
        })
        .catch(error => {
          console.error('Error fetching usages:', error);
        });
    }
  }, [start, end]);

  function updateStart() {
    const startIso = new Date(startRef.current.value).toISOString();
    setStart(startIso);
  }

  function updateEnd() {
    const endIso = new Date(endRef.current.value).toISOString();
    setEnd(endIso);
  }

  const navigationStyles = {
    backgroundColor: '#333',
    height: '50px',
  };

  const listStyles = {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  };

  const itemStyles = {
    float: 'left',
  };

  const linkStyles = {
    display: 'block',
    color: 'white',
    textAlign: 'center',
    padding: '16px',
    textDecoration: 'none',
  };

  return (
    <div>
      <nav style={navigationStyles}>
      <ul style={listStyles}>
        <li style={itemStyles}>
          <a href="/" style={linkStyles}>
            Avaleht
          </a>
        </li>
        <li style={itemStyles}>
          <a href="tarbijad" style={linkStyles}>
            Tarbijad
          </a>
        </li>
        <li style={itemStyles}>
          <a href="seadmed" style={linkStyles}>
            Seadmed
          </a>
        </li>
        <li style={itemStyles}>
          <a href="kasutused" style={linkStyles}>
            Kasutused
          </a>
        </li>
      </ul>
    </nav>
      {url === "/" && 
      <div style={{"margin": "50px"}}>
        <div style={{"marginBottom": "20px", "padding": "10px", "backgroundColor": "#f0f0f0"}}>
          <h3>Backend Connectivity Test</h3>
          <button onClick={() => {
            fetch("/customer")
              .then(res => {
                console.log('Test response:', res);
                return res.text();
              })
              .then(text => {
                console.log('Test response body:', text);
                alert('Response received. Check console for details.');
              })
              .catch(error => {
                console.error('Test error:', error);
                alert('Error: ' + error.message);
              });
          }}>Test Backend Connection</button>
        </div>
        Tegemist on eesrakendusega, mis on mõeldud näitamaks, kuidas kasutada tagarakenduse API otspunkte.
        <br />
        Rakendus on kõigest näiterakendus, eesrakenduse osas ei ole kasutatud parimaid praktikaid, välja arvatud API otspunktidega suhtlemise osas.
        <br />
        Toome välja järgnevad parendused eesrakenduse osas:
        <ul>
          <li>Kasutada CSS klassi HTMLi style= asemel</li>
          <li>Kasutada komponentide põhist lähenemist</li>
          <li>Kasutada navigeerimiseks react-router-dom moodulit</li>
        </ul>
        Rakendus on samas ideaalne näide, kui kooditihedaks võib rakendus kujuneda, kui ei kasutata komponentide põhist lähenemist.
      </div>}
      {url === "/tarbijad" && 
      <div>
        <br />
        <table style={{marginLeft: "100px"}}>
          <thead>
            <tr>
              <th style={{border: "1px solid #ddd", padding: "12px", backgroundColor: "#04AA6D"}}>Eesnimi</th>
              <th style={{border: "1px solid #ddd", padding: "12px", backgroundColor: "#04AA6D"}}>Perenimi</th>
              <th style={{border: "1px solid #ddd", padding: "12px", backgroundColor: "#04AA6D"}}>Tegevused</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((data, index) => 
            <tr key={index}>
              <td style={{border: "1px solid #ddd", padding: "8px"}}>{data.firstName}</td>
              <td style={{border: "1px solid #ddd", padding: "8px"}}>{data.lastName}</td>
              <td style={{border: "1px solid #ddd", padding: "8px"}}> 
                <button onClick={() => deleteCustomer(index)}>Kustuta andmebaasist</button> <br /> 
                <button onClick={() => getCustomerUsages(data.id)}>Näita tarbija kasutusi</button> <br />
                <button onClick={() => showAddUsage(data.id)}>Lisa tarbijale uus kasutus</button> 
              </td>
            </tr>)}
            <tr>
              <td style={{border: "1px solid #ddd", padding: "8px"}}> <input ref={firstNameRef} type="text" /> </td>
              <td style={{border: "1px solid #ddd", padding: "8px"}}> <input ref={lastNameRef} type="text" /> </td>
              <td style={{border: "1px solid #ddd", padding: "8px"}}> <button onClick={addCustomer}>Lisa</button> </td>
            </tr>
          </tbody>
        </table>
        <div>
          {customerUsages.length > 0 && <div>{customerUsages.map(e => <div>Tarbimine ID-ga: {e.id}, summas {e.totalUsageCost} €</div>)}</div>}
          {customerUsages.length > 0 && customerSum === -1 && <button onClick={getCustomerSum}>Näita kogusummat</button> }
          {customerUsages.length > 0 && customerSum !== -1 && <div>{customerSum} €</div> }
          {usagesShownCustomerId >= 0 && customerUsages.length === 0 && <div>Tarbijal pole ühtegi kasutuskorda.</div>}
        </div>
        {addUsageCustomerId !== -1 &&
        <div>
          <div><b>Lisad kasutajale {customers.find(e => e.id === Number(addUsageCustomerId))?.firstName || 'Customer'} uut kasutuskorda</b></div>
          Seade:
          <select onChange={selectDevice} value={deviceSelected}>
            <option value={-1}>Vali seade...</option>
            {devices.map((data, index) => <option key={index} value={data.id}>{data.name} ({data.watts} watti)</option> )}
          </select>
          {deviceSelected >= 0 && 
            <div>
              Valitud: {devices.find(e => e.id === Number(deviceSelected))?.name || 'Unknown Device'} 
              <div>Kasutuse algus: <input ref={startTimeRef} type="datetime-local" /></div>
              <div>Kasutuse lõpp: <input ref={endTimeRef} type="datetime-local" /></div>
              <button onClick={addUsage}>Lisa kasutuskord andmebaasi</button> 
            </div>}
        </div>}
      </div>}
      { url === "/seadmed" && <div style={{"marginLeft": "100px"}}>
          <br />
          <div>Kõik seadmed:</div>
          <select onChange={selectDevice}>
            {devices.map((data, index) => <option key={index} value={data.id}>{data.name} ({data.watts} watti)</option> )}
          </select>
          <div><i>Vali ülevalt milline kustutada</i></div>
          {deviceSelected >= 0 && 
            <div>
              Valitud: {devices.find(e => e.id === Number(deviceSelected))?.name || 'Unknown Device'} 
              <button onClick={deleteDevice}>Kustuta andmebaasist</button> 
            </div>}
            <br /><br />
          <div>Lisa uus seade:</div>
          <label>Seadme nimi</label> <br />
          <input ref={deviceNameRef} type="text" /> <br />
          <label>Seadme võimsus wattides</label> <br />
          <input ref={wattsRef} type="number" /> <br />
          <button onClick={addDevice}>Lisa</button>
        </div> }
        { url === "/kasutused" && 
          <div>
            <div>Filtreeri algusaja järgi:</div>
            <input ref={startRef} onChange={updateStart} type="datetime-local" />
            <input ref={endRef} onChange={updateEnd} type="datetime-local" />
            <table style={{marginLeft: "2%"}}>
              <thead>
                <tr>
                  <th style={{border: "1px solid #ddd", padding: "12px", backgroundColor: "#04AA6D"}}>Kasutaja</th>
                  <th style={{border: "1px solid #ddd", padding: "12px", backgroundColor: "#04AA6D"}}>Seade</th>
                  <th style={{border: "1px solid #ddd", padding: "12px", backgroundColor: "#04AA6D"}}>Algus</th>
                  <th style={{border: "1px solid #ddd", padding: "12px", backgroundColor: "#04AA6D"}}>Lõpp</th>
                  <th style={{border: "1px solid #ddd", padding: "12px", backgroundColor: "#04AA6D"}}>Maksumus</th>
                </tr>
              </thead>
              <tbody>
                {usages.map((data, index) => 
                <tr key={index}>
                  <td style={{border: "1px solid #ddd", padding: "8px"}}>{data.customerId}</td>
                  <td style={{border: "1px solid #ddd", padding: "8px"}}>{data.deviceId}</td>
                  <td style={{border: "1px solid #ddd", padding: "8px"}}>{data.start}</td>
                  <td style={{border: "1px solid #ddd", padding: "8px"}}>{data.end}</td>
                  <td style={{border: "1px solid #ddd", padding: "8px"}}>{data.totalUsageCost}</td>
                </tr>)}
  
              </tbody>
            </table>
          </div>
        }
    </div>
  );
}

export default App;