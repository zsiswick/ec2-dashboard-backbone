app = {};

// Sample Data

var books = [

{title:'Imperial Bedrooms', 	image:'http://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Imperial_bedrooms_cover.JPG/200px-Imperial_bedrooms_cover.JPG'
},

{title:'Less than zero',
image:'http://d.gr-assets.com/books/1282271923l/9915.jpg'
},

];

//Router
app.Router = Backbone.Router.extend({

  routes: {
    '' : 'home',
    'about' : 'about',
    'edit' : 'edit',
  },

  home: function () {
    if(!this.bookListView){
      this.bookListView = new app.BookListView({collection:app.books});
    }else{
      this.bookListView.render();
    }
  },

  about: function () {
    if (!this.aboutView) {
      this.aboutView = new app.AboutView();
    }
    $('.feed').html(this.aboutView.render().el);
  },

  edit: function () {
    if (!this.editView) {
      var coll = this.bookListView.collection;
      this.editView = new app.EditView({collection:app.books});
    };

    $('.feed').html(this.editView.render().el);
  }

});

// Model

app.Book = Backbone.Model.extend({
  defaults: {
    title:'',
    image:'',
  }
});

// Collection

app.BookList = Backbone.Collection.extend ({
  model: app.Book
});

app.books = new app.BookList(books);

// Book View

app.BookView = Backbone.View.extend ({
  tagName: 'div',
  className: 'book',
  template: _.template( $( '#bookTemplate' ).html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

// List of Books View

app.BookListView = Backbone.View.extend({
  el: '.feed',
  initialize: function() {
    this.render();
    this.listenTo( this.collection, 'add', this.renderBook );
  },
  render: function() {
    this.$el.empty();
    this.collection.each(function( item ){
      this.renderBook( item );
    }, this);
  },
  renderBook: function ( item ) {
    var bookview = new app.BookView ({
      model: item
    });
    this.$el.append( bookview.render().el );
  }
});

// Add books view

app.EditView = Backbone.View.extend({
  tagName: 'div',
  className: 'edit',

  template: _.template( $( '#editTemplate' ).html()),

  events:{
    "click #add-book":"addBook"
  },

  addBook:function(e){
    e.preventDefault();

    var title = this.$el.find("#title").val();
    var image = this.$el.find("#image").val();
    var bookModel = new app.Book({title:title,image:image});
    this.collection.add(bookModel);

  },

  render: function () {
    this.$el.html(this.template());
    return this;
  }
});

// About View


app.AboutView = Backbone.View.extend({
  tagName: 'div',
  className: 'about',
  template: _.template( $( '#aboutTemplate' ).html()),
  render: function () {
    this.$el.html(this.template());
    return this;
  }
});


var router = new app.Router();
Backbone.history.start();



app.ServerTallyView = Backbone.View.extend({
  el: '#server-dashboard',

  initialize: function(){
    this.collection = app.servers;
    this.listenTo( this.collection, 'change', this.render );
    this.render();
  },

  tallyServerState: function(servers) { // Helper code

    serverState = { "running":0, "stopped":0, "total": 0 }

    _.each(servers, function(index) {

      if (index.attributes.state === "running") {
        serverState.running ++;

      } else if (index.attributes.state === "stopped") {
        serverState.stopped ++;
      }

      serverState.total ++;
    });
    console.log(serverState);
    return serverState;
  },

  render: function () {
    console.log("Render ServerTally Called...")
    var template = _.template($('#tally-template').html(), {serverTally: this.tallyServerState(this.collection.models)});
    this.$el.html(template);
  }
});
