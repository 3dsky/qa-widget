define(['text!template/answers.html','list/answers','view/answer', 
  'model/answer','qa-api','lib/jquery.autogrow','backbone'],
  function(html,AnswersList,AnswerView,AnswerModel,api){

  return Backbone.View.extend({
    name: "AnswersView",
    template: _.template(html),

    initialize: function() {
      this.log("init");

      if(!this.attributes.parent)
        throw "No parent question";

      this.model = this.attributes.parent.model;

      this.list = new AnswersList();
      this.list.on('reset', this.addAll, this);
      this.list.on('add', this.addOne, this);
      this.list.on('add', this.changed, this);
      this.list.on('remove', this.changed, this);
    },

    events: {
      "click .submit-answer-btn": "submitAnswer"
    },

    submitAnswer: function() {

      var val = this.$('.submit-answer').val();

      if(!val) {
        alert.error("That's not much of an answer is it ?");
        return;
      }

      var questionId = this.model.id;
      if(!questionId)
        throw "Missing question id"

      api.local.answer.submit(questionId, val, this, 
        function(data) {
          if(data.items)
            this.list.add(data.items[0]);
        }
      );
    },

    changed: function() {
      this.$('.answers-container').visible(this.list.length > 0);
    },

    render: function(){
      this.log("render");

      this.$el.html(this.template());
      this.listElem = this.$('.list');

      var answers = this.parentGet('answers');
      if(answers && answers.length > 0) 
        this.list.add(answers);
      else 
        this.changed();

      this.$('textarea').autogrow();

      this.setupTogglers();
    },

    addAll: function() {
      this.list.each(this.addOne,this);
    },

    addOne: function(model) {
      var answerView = new AnswerView({model: model});
      this.listElem.append(answerView.render().hide().delay(100).slideDown('slow'));
    },

    createOne: function(obj) {
      var model = new AnswerModel(obj);
      this.list.add(model);
    }

  });
});