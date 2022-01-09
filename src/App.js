import { useState } from "react";
import "./styles.css";

export default function App() {
  const API = "https://candidate.hubteam.com/candidateTest/v3/problem/";

  const [partners, setPartners] = useState(null);

  const handleClick = () => {
    //fetch the partners data
    fetch(`${API}dataset?userKey=ca5c13afa1929945975224312a3a`)
      .then((response) => response.json())
      .then((data) => {
        const result = data.partners;
        let countries = {};

        // seperate the partners for their contries and keep it in object for further process
        result.forEach((partner) => {
          let arr = [];
          if (countries[partner.country]) {
            arr = countries[partner.country];
            arr.push(partner);
          } else {
            arr.push(partner);
          }
          countries[partner.country] = arr;
        });

        // get the partners for invitation on the base of logic mentioned in coding challenge
        const partnersWithCountryForInvitation = getPartnerListForInvitation(
          countries
        );

        // post partners for invitation with country in expected format
        postPartnersListForInvitationWithCountry(
          partnersWithCountryForInvitation
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  /**
   * This function is getting used to filter the partners for invitation
   */
  const getPartnerListForInvitation = (countries) => {
    let inviteDateWithCountries = [];
    // loop countries for partners
    for (const country in countries) {
      const partners = countries[country];
      let dateWithPartnerAvailablility = {};

      //partners looping to check the available dates
      partners.forEach((partner) => {
        if (partner.availableDates && partner.availableDates.length > 0) {
          for (let i = 1; i < partner.availableDates.length; i++) {
            // check if the dates are consecutive
            if (
              daysBetween(
                partner.availableDates[i - 1],
                partner.availableDates[i]
              ) === 1
            ) {
              let arr = [];
              if (dateWithPartnerAvailablility[partner.availableDates[i - 1]]) {
                arr =
                  dateWithPartnerAvailablility[partner.availableDates[i - 1]];
                arr.push(partner.email);
              } else {
                arr.push(partner.email);
              }
              // add the consecutive first date of consecutive dates in array
              dateWithPartnerAvailablility[partner.availableDates[i - 1]] = arr;
            }
          }
        }
      });

      // loop the dates list to get the maximum number of partners for particular date.
      let maxCount = 0;
      let maxPartners;
      let maxPartnersDate;
      for (const date in dateWithPartnerAvailablility) {
        //make sure first invitation date is getting selected when two dates have same count for partners
        if (dateWithPartnerAvailablility[date].length > maxCount) {
          maxCount = dateWithPartnerAvailablility[date].length;
          maxPartners = dateWithPartnerAvailablility[date];
          maxPartnersDate = date;
        }
      }

      // prepare and push the object to invitation list with country
      inviteDateWithCountries.push({
        attendeeCount: maxCount,
        attendees: maxPartners ? maxPartners : [],
        name: country,
        startDate: maxPartnersDate ? maxPartnersDate : null
      });
    }
    return inviteDateWithCountries;
  };

  /**
   * This function is gettin used to check the dates are consecutive
   */
  const daysBetween = (date1String, date2String) => {
    var d1 = new Date(date1String);
    var d2 = new Date(date2String);
    return (d2 - d1) / (1000 * 3600 * 24);
  };

  /**
   * This function is getting used to post all the partnes list which needs the invitation.
   */
  const postPartnersListForInvitationWithCountry = (
    partnersWithCountryForInvitation
  ) => {
    fetch(`${API}result?userKey=ca5c13afa1929945975224312a3a`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ countries: partnersWithCountryForInvitation })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    setPartners(partnersWithCountryForInvitation);
  };

  return (
    <div className="App">
      <h3>Click Button to get the invitation date and partners</h3>
      <button onClick={handleClick}>Click Me</button>
      {partners && (
        <table style={{ border: "1px solid black", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black" }}>Date</th>
              <th style={{ border: "1px solid black" }}>Country</th>
              <th style={{ border: "1px solid black" }}>Partners</th>
              <th style={{ border: "1px solid black" }}>count</th>
            </tr>
          </thead>

          <tbody>
            {partners.map((partner) => (
              <tr key={partner.name}>
                <td style={{ border: "1px solid black" }}>
                  {partner.startDate}
                </td>
                <td style={{ border: "1px solid black" }}>{partner.name}</td>
                <td style={{ border: "1px solid black" }}>
                  {partner.attendees &&
                    partner.attendees.map((attendee) => (
                      <div key={attendee}>{attendee}</div>
                    ))}
                </td>
                <td style={{ border: "1px solid black" }}>
                  {partner.attendeeCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
