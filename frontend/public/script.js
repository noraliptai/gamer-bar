const root = document.getElementById("root")

const headerComponent = () => `
  <div id="headerContent">
    <h1>Welcome to Galaxy Gamer Bar!</h1>
    <h3>Choose your poison!</h3>
    <button id="editor">Editor mode</button>
  <div>
`

const drinkListComponent = (drink) => `
  <div class="listItem">  
    <h2>${drink.name}</h2>
    <h4>${drink.base}, ${drink.ingredients.map(ingredient => ingredient).join(", ")}</h4>
    <h4 class="special">Special ingredient: ${drink['special-ingredient']}</h4>
    <p>$${drink.price}</p>
    <button class="edit hidden">Edit</button>
    <button class="delete hidden">Delete</button>
  </div>
`

const typeSelector = (type) => `
  <select label="types" value=${type ? type : null}>
    <option value="Long drink" ${type === "Long drink" ? "selected" : ""}>Long drink</option>
    <option value="Short drink" ${type === "Short drink" ? "selected" : ""}>Short drink</option>
    <option value="Shot" ${type === "Shot" ? "selected" : ""}>Shot</option>
  </select>
`

const newFormComponent = () => `
  <div id="newForm">
    <h3>Add a new drink to the menu</h3>
    <form>
      <p>Name:</p><input type="text" label="name" placeholder="Name" required/>
      <p>Type:</p>${typeSelector()}
      <p>Base alcohol:</p><input type="text" label="base" placeholder="Base alcohol" required/>
      <p>Ingredients:</p><input type="text" label="ingredients" placeholder="Ingredient"/>
      <br><button type="button" id="newIngredient" class="addNew">Add new ingredient</button>
      <p>Special ingredient:</p><input type="text" label="special" placeholder="Special ingredient" required/>
      <p>Price ($):</p><input type="number" label="price" placeholder="Price" required/>
      <br><button type="submit" class="submit">Submit</button>
    </form>
  </div>
`

const editFormComponent = (selectedDrink) => `
  <div id="editForm">
    <h3>Edit this drink: ${selectedDrink.name}</h3>
    <form>
      <p>Name:</p><input type="text" label="name" value="${selectedDrink.name}" required/>
      <p>Type:</p>${typeSelector(selectedDrink.type)}
      <p>Base alcohol:</p><input type="text" label="base" value="${selectedDrink.base}" required/>
      <p>Ingredients:</p>${selectedDrink.ingredients.map(ingredient => `
        <p>
          <input type="text" label="ingredients" value="${ingredient}"/>
          <button type="button" class="remove">remove</button>
        </p>
      `).join("")}
      <button type="button" id="newIngredient" class="addNew">Add new ingredient</button>
      <p>Special ingredient:</p><input type="text" label="special" value="${selectedDrink['special-ingredient']}" required/>
      <p>Price ($):</p><input type="number" label="price" value="${selectedDrink.price}" required/>
      <br><button type="submit" class="submit">Submit</button>
    </form>
  </div>
`

const fetchDrinks = () => {
  const main = document.querySelector("main")
  main.innerHTML = null
  
  fetch('/api/drinks')
    .then(res => res.json())
    .then(drinks => {
      main.insertAdjacentHTML("beforeend", `<div id="longdrinks"><h1>LONG DRINKS</h1></div>`)
      const longDrinks = document.getElementById("longdrinks")
      drinks.filter(drink => drink.type === "Long drink").forEach(drink => {
        longDrinks.insertAdjacentHTML("beforeend", drinkListComponent(drink))
      })
      main.insertAdjacentHTML("beforeend", `<div id="shortdrinks"><h1>SHORT DRINKS</h1></div>`)
      const shortDrinks = document.getElementById("shortdrinks")
      drinks.filter(drink => drink.type === "Short drink").forEach(drink => {
        shortDrinks.insertAdjacentHTML("beforeend", drinkListComponent(drink))
      })
      main.insertAdjacentHTML("beforeend", `<div id="shots"><h1>SHOTS</h1></div>`)
      const shots = document.getElementById("shots")
      drinks.filter(drink => drink.type === "Shot").forEach(drink => {
        shots.insertAdjacentHTML("beforeend", drinkListComponent(drink))
      })

      if (document.getElementById("editor").innerText === "Back") {
        document.querySelectorAll(".edit, .delete").forEach(button => button.classList.remove("hidden"))
        if (!document.getElementById("newForm")) createNewForm()
      }

      const deleteButtons = document.querySelectorAll(".delete")
      deleteButtons.forEach(deleteButton => {
        const selectedDrink = drinks.find(drink => drink.name === deleteButton.parentElement.firstElementChild.innerText)
        deleteButton.addEventListener("click", () => deleteEvent(selectedDrink))
      })

      const editButtons = document.querySelectorAll(".edit")
      editButtons.forEach(editButton => {
        const selectedDrink = drinks.find(drink => drink.name === editButton.parentElement.firstElementChild.innerText)
        editButton.addEventListener("click", () => editDrink(selectedDrink))
      })
    })
}

const deleteEvent = (selectedDrink) => {
  fetch(`/api/drinks/${selectedDrink.id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id: selectedDrink.id })
	})
		.then(res => {
			if (res.status === 200) return res.json()
			else throw Error(`error at deleting drink: ${selectedDrink.id}`)
		})
		.then(resJson => {
			console.log(resJson)
			fetchDrinks()
		})
}

const editDrink = (selectedDrink) => {
  if (document.getElementById("editForm")) document.getElementById("editForm").remove()
  document.querySelector("main").insertAdjacentHTML("beforebegin", editFormComponent(selectedDrink))
  
  window.history.pushState({info: "updated URL"}, "", selectedDrink.id)
  
  const editForm = document.querySelector("#editForm form")
  editForm.addEventListener("submit", (event) => {
    event.preventDefault()

    fetch(`/api/drinks/${selectedDrink.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: selectedDrink.id,
        newData: objectFromForm(editForm)
      })
    })
      .then(res => {
        if (res.status === 200) return res.json()
        else throw Error(`error at updating drink: ${selectedDrink.id}`)
      })
      .then(resJson => {
        console.log(resJson)
        editForm.parentElement.remove()
        fetchDrinks()
      })
  })
}

const objectFromForm = (form) => {
  return {
    name: form.querySelector('input[label="name"]').value,
    type: form.querySelector('select[label="types"]').value,
    base: form.querySelector('input[label="base"]').value,
    ingredients: [...form.querySelectorAll('input[label="ingredients"]')].map(ingredient => ingredient.value),
    'special-ingredient': form.querySelector('input[label="special"]').value,
    price: parseFloat(form.querySelector('input[label="price"]').value)
  }
}

const submitNewDrink = (event) => {
  event.preventDefault()
  const newDrinkForm = document.querySelector("#newForm form")

  fetch('/api/drinks', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(objectFromForm(newDrinkForm))
  }).then(resJson => {
    console.log(resJson)
    document.getElementById("newForm").remove()
    createNewForm()
    fetchDrinks()
  })
}

const addEventToNewButtons = (form) => {
  const handleRemoval = (form) => {
    const removeButtons = form.querySelectorAll(".remove")
    removeButtons.forEach(removeButton => {
      removeButton.addEventListener("click", () => {
        removeButton.parentElement.remove()
      })
    })
  }
  
  const addNewButtons = form.querySelectorAll(".addNew")
  addNewButtons.forEach(button => {
    button.addEventListener("click", () => {
      button.insertAdjacentHTML("beforebegin", `
        <p>
          <input type="text" label="ingredients" placeholder="Ingredient" />
          <button type="button" class="remove">Remove</button>
        </p>
      `)
      handleRemoval(form)
    })
  })
  handleRemoval(form)
}

const createNewForm = () => {
  const main = document.querySelector("main")
  main.insertAdjacentHTML("beforebegin", newFormComponent())

  addEventToNewButtons(document.getElementById("newForm"))

  document.querySelector("#newForm form").addEventListener("submit", (event) => submitNewDrink(event))
}

const editorButtonEvent = () => {
  const editorButton = document.getElementById("editor")
  editorButton.addEventListener("click", () => {
    if (editorButton.innerText === "Editor mode") {
      document.querySelectorAll(".edit, .delete").forEach(button => button.classList.remove("hidden"))
      editorButton.innerText = "Back"
      createNewForm()
    } else {
      document.querySelectorAll(".edit, .delete").forEach(button => button.classList.add("hidden"))
      editorButton.innerText = "Editor mode"
      document.getElementById("newForm").remove()
      if (document.getElementById("editForm")) document.getElementById("editForm").remove()
    }
  })
}

const init = () => {
  root.insertAdjacentHTML("beforeend", `
  <header></header>
  <div id="container">
    <main></main>
  </div>
  `)
  const header = document.querySelector("header")
  header.insertAdjacentHTML("beforeend", headerComponent())

  fetchDrinks()
  
  editorButtonEvent()
}

init()