//get DOM elements
const peopleList = document.getElementById('people-list');
const addPersonBtn = document.getElementById('add-person-btn');
const calculateBtn = document.getElementById('calculate-btn');
const totalBillInput = document.getElementById('total-bill');
const tipInput = document.getElementById('tip-percent');
const resultsDiv = document.getElementById('results');

const taxPercent = 13; // fixed tax percentage (ontario)

let people = [];

//renders all ppl on the list
function renderPeople() {
  peopleList.innerHTML = ''; //clear current list

  //add person to page
  people.forEach((person, index) => {

    const div = document.createElement('div');

    div.className = 'person';

    //Each person has a name, amount paid, personal items, and a remove button
    div.innerHTML = `
      <input type="text" placeholder="Name" value="${person.name}" data-index="${index}" class="name-input cute-input" />
      <input type="number" placeholder="Amount Paid ($)" min="0" step="0.01" value="${person.amount}" data-index="${index}" class="amount-input cute-input" />
      <input type="number" placeholder="Personal Items ($)" min="0" step="0.01" value="${person.personal}" data-index="${index}" class="personal-input cute-input" />
      <button data-index="${index}" class="remove-btn">
        <img src="assets/remove button.png" alt"remove" />
      </button>
    `;
    peopleList.appendChild(div); // add this person to DOM
  });

  //Update person's name
  document.querySelectorAll('.name-input').forEach(input => {
    input.oninput = e => {
      const i = e.target.dataset.index;
      people[i].name = e.target.value;
    };
  });

  //Update amount paid
  document.querySelectorAll('.amount-input').forEach(input => {
    input.oninput = e => {
      const i = e.target.dataset.index;
      people[i].amount = parseFloat(e.target.value) || 0;
    };
  });

  //Update personal item cost
  document.querySelectorAll('.personal-input').forEach(input => {
    input.oninput = e => {
      const i = e.target.dataset.index;
      people[i].personal = parseFloat(e.target.value) || 0;
    };
  });

  //Remove a person
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = e => {
      const i = e.currentTarget.dataset.index;
      people.splice(i, 1);
      renderPeople();
    };
  });
}

//Add a new empty person when clicked
addPersonBtn.onclick = () => {
  people.push({ name: '', amount: '', personal: '' });
  renderPeople();
};

//calculate what everyone owes
function calculateSplits(totalBill, tipPercent, people) {
  if (totalBill <= 0 || people.length === 0) return null;

  //Total shared bill (bill + tax + tip)
  const sharedMultiplier = 1 + (taxPercent + tipPercent) / 100;
  const sharedTotal = totalBill * sharedMultiplier;
  const sharedPerPerson = sharedTotal / people.length;

  const personalMultiplier = 1 + taxPercent / 100;

  //Calculate how much each person owes and paid
  return people.map(p => {
    const personal = p.personal || 0;
    const personalWithTax = personal * personalMultiplier;
    const paid = p.amount || 0;
    const totalOwed = +(sharedPerPerson + personalWithTax).toFixed(2);
    const balance = +(paid - totalOwed).toFixed(2);
    return {
      name: p.name || 'Unnamed',
      paid: +paid.toFixed(2) || 0,
      sharedOwed: +sharedPerPerson.toFixed(2),
      personal: +personalWithTax.toFixed(2),
      totalOwed,
      balance,
      //label their status (owe, gets back, or settles)
      status: balance === 0 ? 'settled' : balance > 0 ? 'gets back' : 'owes'
    };
  });
}

//run when "Calculate" is clicked
calculateBtn.onclick = () => {
    const totalBill = parseFloat(totalBillInput.value);
    const tipPercent = parseFloat(tipInput.value) || 0;

    //don't calculate if bill or ppl are missing
    if (!totalBill || people.length === 0) {
      resultsDiv.textContent = 'Please enter total bill and add at least one person.';
      return;
    }
  
    const results = calculateSplits(totalBill, tipPercent, people);
    if (!results) {
      resultsDiv.textContent = 'Invalid input.';
      return;
    }
  
    const sharedMultiplier = 1 + (taxPercent + tipPercent) / 100;
    const sharedTotal = totalBill * sharedMultiplier;
  
    //Results table
    let html = `<h3>Results (with ${tipPercent}% tip and ${taxPercent}% tax):</h3>`;
    html += `<p>Total with Tax + Tip: $${sharedTotal.toFixed(2)}</p>`;
    html += `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">`;
    html += `
      <thead style="background-color:rgb(255, 250, 252);">
        <tr>
          <th>Name</th>
          <th>Paid ($)</th>
          <th>Shared Owed ($)</th>
          <th>Personal Owed ($)</th>
          <th>Total Owed ($)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody> 
    `;
  
    //fill in a row for each person
    results.forEach(r => {
      html += `
        <tr>
          <td>${r.name}</td>
          <td>${r.paid.toFixed(2)}</td>
          <td>${r.sharedOwed.toFixed(2)}</td>
          <td>${r.personal.toFixed(2)}</td>
          <td><b>${r.totalOwed.toFixed(2)}</b></td>
          <td>${r.status} $${Math.abs(r.balance).toFixed(2)}</td>
        </tr>
      `;
    });
  
    html += '</tbody></table>';
  
    //show final results
    resultsDiv.innerHTML = html;
  };

//auto add the first person when the page loads
addPersonBtn.click();