// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

mongoose.connect("mongodb+srv://dushyantdb:dushyantdb@cluster0.uaymc.mongodb.net/todolistDB" ,{useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('useFindAndModify', false);

// building db schema 
const itemsSchema = {
    name : String ,
};

// buildig schema for list 
const listSchema = {
    name : String,
    items : [itemsSchema]
};


// building models 
const itemsModel = mongoose.model( "Item" ,itemsSchema)
// buildind model for list schema 
const listModel = mongoose.model("list" , listSchema )

// default items 
const welcomeNote = new itemsModel({
    name : "WELCOME! to TODOLIST"
});
const instructionNote = new itemsModel({
    name : "To add a item ,just press +"
});
const helpingNote = new itemsModel({
    name : "Thank you!!"
});

const defaultItems = [welcomeNote , instructionNote , helpingNote];



const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get("/", function (req, res) {
   let day = date();

itemsModel.find({} , function(err , result){
 if (result.length === 0) {
     itemsModel.insertMany( defaultItems , function(err){
    if(err){ 
        // console.log(err);
        
     }else{
     console.log("done!");
    }
    });
    res.redirect("/");
 }else{
    res.render('list', { listTitle: day ,Newlistitem: result});
 }
})
});

app.get("/:customList" ,function(req,res){
    const customListName = _.capitalize(req.params.customList);

    
// finding existing list 
listModel.findOne({name : customListName}, function(err, result){
    // console.log(err);
if (!result) {
    const list = new listModel({
        name : customListName,
        items : defaultItems
    })
    list.save(); 
    res.redirect( "/" + customListName)
}else{
    res.render('list', { listTitle: result.name ,Newlistitem: result.items});
}})

})


app.post("/" ,function(req,res){
    let day = date();
    const itemName = req.body.Newitem;
const listName = req.body.list;
  const item = new itemsModel({
      name: itemName
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  }else {
      listModel.findOne({name:listName},function(err,result){
          console.log(result);
        result.items.push(item);
          result.save();
          res.redirect("/" + listName);
      })
  }
});

app.post("/delete" ,function(req,res){
    const checkedId = req.body.checkbox;
const DeletedlistName = req.body.deletedListName;
let day = date();
if (DeletedlistName === day) {
    itemsModel.findByIdAndRemove(checkedId , function(err){
        if (err) {
            console.log(err);
        }else{
            console.log("deleted");
        }
    });
    res.redirect("/");
}else{
    listModel.findOneAndUpdate({name: DeletedlistName}, {
        $pull : {items : {_id : checkedId}}
    }, function(err , foundList){
        if(!err){
            res.redirect("/" + DeletedlistName);
        }
    })
}
})
 


app.post("/work" ,function(req,res){
    let item = req.body.Newitem;
    workItems.push(item);
    res.redirect("/work");
})

app.get("/about", function(req,res){
    res.render('about');
})


app.listen( process.env.PORT ||3000, function () {
    console.log("server running");
});