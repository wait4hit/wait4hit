//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongodb+srv://Abdennour:Conference123.@cluster0.onbbl.mongodb.net/WaitDB?retryWrites=true&w=majority
mongoose.connect(
  "mongodb+srv://Abdennour:Conference123.@cluster0.onbbl.mongodb.net/WaitDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// mongoose.connect("mongodb+srv://admin-ben:Cloud0204.@cluster0.5ju0x.mongodb.net/todolistDB",  {
//   useNewUrlParser: true,
//   useUnifiedTopology: true});

const itemsSchema = {
  name: String,
};
const userSchema = {
  id: String,
  fName: String,
  lName: String,
  email: String,
  login: String,
  eventID: String,
  profile: String,
  password: String,
};

const Item = mongoose.model("Item", itemsSchema);
const User = mongoose.model("User", userSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const user1 = new User({
  fName: "Abdennour",
  lName: "Benyahia",
  email: "benyahia.ab@gmail.com",
  login: "abde",
  eventID: "01",
  profile: "Admin",
  password: "No",
});

const user2 = new User({
  fName: "Abdennour2",
  lName: "Benyahia2",
  email: "benyahia.ab@gmail.com",
  login: "abde2",
  eventID: "02",
  profile: "Admin2",
  password: "No2",
});

const defaultItems = [item1, item2, item3];
const defaulUsers = [user1, user2];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const listUserSchema = {
  name: String,
  user: [userSchema],
};

const List = mongoose.model("List", listSchema);
const ListUser = mongoose.model("ListUsers", listUserSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    // console.log(foundItems);
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      User.find({}, function (err, foundUsers) {
        console.log(foundUsers.length );
        if (foundUsers.length === 1) {
          console.log(defaulUsers );
          User.insertMany(defaulUsers, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("Successfully savevd default users to DB.");
            }
          });
      //     res.redirect("/");
        }
        //  else {
      //     // res.render("list", { listTitle: "Today", newListItems: foundItems });
      //   }
      });
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started successfully");
});
