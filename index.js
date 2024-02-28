const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/frontend/index.html`))
})

app.use('/public', express.static(path.join(`${__dirname}/frontend/public`)))

app.get('/api/drinks', (req, res) => {
  res.sendFile(path.join(`${__dirname}/drinks.json`), (err) => {
    if (err) {
      console.log(err)
      res.send(err)
    } else {
      console.log('drinks menu has been sent')
    }
  })
})

app.post('/api/drinks', (req, res) => {

  fs.readFile(`${__dirname}/drinks.json`, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
      res.send(err)
    } else {
      const drinks = JSON.parse(data)
      const lastId = drinks[drinks.length - 1].id
      const newDrink = req.body
      newDrink.id = lastId + 1
      drinks.push(newDrink)

      fs.writeFile(`${__dirname}/drinks.json`, JSON.stringify(drinks, 0, 2), (err) => {
        if (err) {
          console.log(err)
          res.send(err)
        } else {
          console.log(`drink created: ${newDrink.name}`)
          res.send(newDrink)
        }
      })
    }
  })
})

app.delete('/api/drinks/:id', (req, res) => {

  const drinkToDelete = req.body.id

  fs.readFile(path.join(__dirname, '/drinks.json'), 'utf8', (err, data) => {
    if (err) {
      console.log(`error at reading file: ${err}`)
      res.status(500).json(err)
    } else {
      const drinks = JSON.parse(data)
      
      let deletedDrink
      const remainingDrinks = []

      for (let i = 0; i < drinks.length; i++) {
        if (drinks[i].id !== drinkToDelete) {
          remainingDrinks.push(drinks[i])
        } else {
          deletedDrink = drinks[i]
        }
      }

      if (deletedDrink) {

        fs.writeFile(path.join(__dirname, '/drinks.json'), JSON.stringify(remainingDrinks, 0, 2), (err) => {
          if (err) {
            console.log(`error at writing file: ${err}`)
            res.status(500).json(err)
          } else {
            console.log(`deleted drink: ${deletedDrink.name}, deleted data: ${JSON.stringify(deletedDrink)}`)
            res.status(200).json(`deleted drink: ${deletedDrink.name}, deleted data: ${JSON.stringify(deletedDrink)}`)
          }
        })

      } else {
        console.log(`drink: ${drinkToDelete} not found`)
        res.status(404).json(`drink: ${drinkToDelete} not found`)
      }
      }
  })
})

app.patch('/api/drinks/:id', (req, res) => {
  
  const drinkId = req.body.id
  const newData = req.body.newData
  const keysToChange = Object.keys(newData)

  fs.readFile(path.join(__dirname, '/drinks.json'), 'utf8', (err, data) => {
    if (err) {
      console.log(`error at reading file: ${err}`)
      res.status(500).json(err)
    } else {
      const drinks = JSON.parse(data)
      const drinkToEdit = drinks.find(drink => drink.id === drinkId)

      if (drinkToEdit) {
        keysToChange.forEach(key => {
          if (Object.keys(drinkToEdit).includes(key)) {
            drinkToEdit[key] = newData[key]
          } else {
            console.log(`${key} is not a valid key on drink`)
          }
        })

        fs.writeFile(path.join(__dirname, '/drinks.json'), JSON.stringify(drinks, 0, 2), (err) => {
          if (err) {
            console.log(`error at writing file: ${err}`)
            res.json(`error at reading file: ${err}`)
          } else {
            console.log(`drink ${drinkId} has been successfully changed, new data: ${JSON.stringify(newData)}`)
            res.json(`drink ${drinkId} has been successfully changed, new data: ${JSON.stringify(newData)}`)
          }
        })

      } else {
        console.log(`drink ${drinkId} is not found`)
        res.json(`drink ${drinkId} is not found`)
      }
    }
  })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})