/*global Ec2DashboardBackbone, $*/
app = {};


/*////////////////
* Bootstrap Data
*////////////////

var servers = [
  {"name": "Storm Shadow", "id": "ODB6JY", "type": "T1 Micro", "state": "running", "az": "us-east-1b", "publicIP": "54.210.167.204", "privateIP": "10.20.30.40", selected: false},
{"name": "Duke", "id": "7NM61H", "type": "T2 Small", "state": "stopped", "az": "us-east-1b", "publicIP": "204.96.41.77", "privateIP": "227.85.207.100", selected: false},
  {"name": "Destro", "id": "9A0W9H", "type": "C3 High-CPU Large", "state": "stopped", "az": "us-west-3c", "publicIP": "155.141.18.227", "privateIP": "192.210.209.71", selected: false},
{"name": "Snake Eyes", "id": "Q7QU72", "type": "M1 General Medium", "state": "running", "az": "us-west-3c", "publicIP": "208.183.37.64", "privateIP": "24.59.117.71", selected: false},
  {"name": "Cobra Commander", "id": "IAWG6G", "type": "T2 Medium", "state": "running", "az": "us-west-3c", "publicIP": "90.211.225.61", "privateIP": "182.163.140.132", selected: false},
  {"name": "Zartan", "id": "W5A5XB", "type": "T1 Micro", "state": "stopped", "az": "us-west-3c", "publicIP": "5.181.209.232", "privateIP": "11.161.78.166", selected: false}
];


/*////////////
* Routes
*////////////

app.Router = Backbone.Router.extend({

  routes: {
    '' : 'home'
  },

  home: function () {
    if(!this.serverListView){
      this.serverListView = new app.ServerListView({collection: app.servers});

    }else{
      this.serverListView.render();
    }
  }
});


/*////////////////
* Server Model
*////////////////

app.Server = Backbone.Model.extend({
  defaults: {
    name: 'GI Joe',
    id: Math.random() * (12 - 1) + 1,
    type: 'T1 Micro',
    state: 'running',
    az: 'us-east-1b',
    publicIP: '54.210.167.204',
    privateIP: '192.210.209.71',
    selected: false
  }
});


/*//////////////////
* ServerTally Model
*//////////////////

app.ServerTally = Backbone.Model.extend({
  defaults: {
    stopped: 0,
    running: 0,
    total: 0,
    countSelected: 0,
    selected: false
  }
});

app.serverTally = new app.ServerTally({

  tallyAttribute: function(attr, val) {
    var total = 0;
    _.each(app.servers.models, function(index) {
      if (index.attributes[attr] === val) {
        total ++;
      }
    });
    return total;
  },
  stopped: function() {
    return this.tallyAttribute('state', 'stopped');
  },
  running: function() {
    return this.tallyAttribute('state', 'running');
  },
  total: function() {
    return app.servers.length;
  },
  countSelected: function() {
    return this.tallyAttribute('selected', true);
  },
  selected: false,
  counter: 0 // Method to force views to refresh when number changes
});


/*//////////////////
* Server Collection
*//////////////////

app.ServerList = Backbone.Collection.extend ({
  model: app.Server,
  sortAttribute: "name",
  sortServers: function(attr) {
    this.sortAttribute = attr;
    this.sort();
  },
  comparator: function(item) {
    return item.get(this.sortAttribute);
  }
});

app.servers = new app.ServerList(servers);


/*//////////////////
* Server View
*//////////////////

app.ServerView = Backbone.View.extend ({
  tagName: 'tr',
  className: 'server',
  template: _.template( $( '#server-rows' ).html()),
  events:{
    "click button.start":"startServer",
    "click button.stop":"stopServer",
    "click input[type='checkbox']":"setSelected"
  },
  initialize: function(){
    this.listenTo(this.model, "change", this.render);
  },
  startServer: function() {
    this.model.set({state: "running"});
    app.refreshTally();
  },
  stopServer: function() {
    this.model.set({state: "stopped"});
    val = app.serverTally.get("counter") + 1;
    app.refreshTally();
  },
  setSelected: function(event) {
    if (this.model.get("selected") == false) {
      this.model.set({selected: true});
      this.$el.addClass('selected');
    } else {
      this.model.set({selected: false});
      this.$el.removeClass('selected');
    }
    app.refreshTally();
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});


/*//////////////////
* Server List View
*//////////////////

app.ServerListView = Backbone.View.extend({
  el: '#server-list',

  initialize: function(){
    this.render();
    this.listenTo(this.collection, "sort", this.render);
  },
  render: function() {
    this.$el.empty();
    this.collection.each(function( item ){
      this.renderServer( item );
    }, this);
  },
  renderServer: function ( item ) {
    var serverview = new app.ServerView ({
      model: item
    });
    this.$el.append( serverview.render().el );
  }
});


/*//////////////////
* Server Tally View
*//////////////////

app.ServerTallyView = Backbone.View.extend ({
  el: '#server-dashboard',

  template: _.template($('#tally-template').html()),

  initialize: function(){
    this.listenTo(this.model, "change", this.render);
    this.render();
  },
  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
});

app.serverTallyView = new app.ServerTallyView({model: app.serverTally});


/*//////////////////
* Server Panel View
*//////////////////

app.ServerPanelView = Backbone.View.extend ({
  el: '#panelBody',

  template: _.template($('#panelTemplate').html()),

  events:{
    "click #selectAll":"selectAll",
    "click #groupStart":"groupStart",
    "click #groupStop":"groupStop",
    "change select.form-control":"sortCollection"
  },

  sortCollection: function(e) {
    var val = $(e.currentTarget).val();
    app.servers.sortServers(val);
  },
  selectAll: function(event) {
    if ($("#selectAll:checked").length) {
      _.each(app.servers.models, function(index) {
        index.set({selected: true});
        $('#server-list tr').addClass('selected');
      });
      app.serverTally.set("selected", true);
    } else {
      _.each(app.servers.models, function(index) {
        index.set({selected: false});
        $('#server-list tr').removeClass('selected');
      });
      app.serverTally.set("selected", false);
    }
    app.refreshTally();
  },
  groupStart: function() {
    _.each(app.servers.models, function(index) {
      if ( index.get("selected") === true ) index.set({state: "running"});
    });
    app.refreshTally();
  },
  groupStop: function() {
    _.each(app.servers.models, function(index) {
      if ( index.get("selected") === true ) index.set({state: "stopped"});
    });
    app.refreshTally();
  },
  initialize: function(){
    this.listenTo(this.model, "change", this.render);
    this.render();
  },
  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
});

app.serverPanelView = new app.ServerPanelView({model: app.serverTally});


/*//////////////////
* Utility Function
*//////////////////

app.refreshTally = function() {

  // Method to refresh serverTally model

  val = app.serverTally.get("counter") + 1;
  app.serverTally.set("counter", val);
}


/*//////////////////
* Init
*//////////////////

var router = new app.Router();
Backbone.history.start();
