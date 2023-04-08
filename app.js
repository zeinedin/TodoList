//!imports
require("dotenv").config();
const express = require("express");
const body = require("body-parser");
const bodyParser = require("body-parser");
const { render } = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const port = process.env.PORT || 3000;


//!Using
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(body.urlencoded({ extended: true }));

//!Arrays declaration
const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Bannana",
});

const item2 = new Item({
  name: "Milk",
});

const item3 = new Item({
  name: "Writeings",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  Item.find()
  .then((items) => {
     if (items.length === 0) {
      Item.insertMany(defaultItems)
      .then(() => { 
        console.log("Items added");
        }).catch((err) => { 
          console.log(err); 
        });
        } else {
          res.render("list", { listTitle: "Today", items: items });
        }
  })
  .catch((err) => console.log(err));
});
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName, itemName);

  const item = new Item({
    name: itemName,
  });
  console.log("the list name is " + listName);

  if (listName === "Today") {
    item.save().then(() => {
       res.redirect("/"); 
      }).catch((err) => {
        console.log(err)
      });
  } else {
    List.findOne({ name: listName })
    .then((foundList) => {
      if (!foundList) {
        console.log("List not found");
      }
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItems = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItems)
      .then((result) => {
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  } else {
    List.findOneAndDelete(
      { name: listName },
      { $pull: { items: { _id: checkedItems } } }
    ).then((result) => {
      if (result) {
        result.items.pull({ _id: checkedItems });
        return result.save();
      }
    })
    .then(()=>{
      console.log("We have removed the item with id: " + checkedItems + " from " + listName + " list");
      res.redirect("/" + listName);
    }).catch((err) => console.log(err));
  }
});

app.get("/:CustomName", (req, res) => {
  const CustomName = req.params.CustomName;

  List.findOne({ name: CustomName })
    .then((result) => {
      if (result) {
        const list = new List({
          name: CustomName,
          items: defaultItems,
        });
        list.save()
        .then(() => {
          console.log("New list created and saved to the database.");
          res.redirect("/" + CustomName); // Redirect the user to the new list's page
        }).catch((err) => {
            console.log(err);
          });
      } else {
        console.log("List already exists");
        res.render("list", { listTitle: result.name, items: result.items });
      }
    })
    .catch((err) => console.log(err));
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

const start = async () => {
  try {
    await connectDB();
    app.listen(port, (req, res) => {
      console.log("Server started.");
    });
  } catch (err) {
    console.log(err);
  }
};

start();