/* ========================================================================
 * buildafaq: blocks.js v0.0.1
 * ========================================================================
 * Copyright 2014 Dave Klein
 * Licensed under Apache License 2.0 
 *              (https://github.com/drk123/buildafaq/blob/master/LICENSE)
 * ======================================================================== */

var AAAIds = {};
var AAACount = 0;
function AAANextId(block, prefix)
{
  var alreadyThere = true;
  var id;
  var count = AAACount;
  while (alreadyThere)
  {
     count++;
	 id = prefix + count;
	 alreadyThere = AAAIds[id];
  }
  if (!block.workspace.isFlyout) 
  {
    AAAIds[id] = id;
    AAACount = count;
  }

  return id;
}

function AAAValidateId(id)
{
	var newId = id.trim().replace(/\//g, "");
	AAAIds[newId] = newId;
	
	return newId;
}

Blockly.FAQ = {};
Blockly.FAQ.faqConnectors = ["question_multiple", "question_single", "question_link"];
Blockly.FAQ.helpLink = 'https://drk123.github.io/buildafaq/help.html';

Blockly.Blocks['question_multiple'] = {
  init: function() {
	this.defaultValues = { title: "title" };
    this.setHelpUrl(Blockly.FAQ.helpLink + "#question_multiple");
    this.setColour(360);
    this.appendDummyInput()
        .appendField("multiple");
    this.appendDummyInput()
        .appendField("id")
        .appendField(new Blockly.FieldTextInput(AAANextId(this, "q"), AAAValidateId), "id");
    this.appendDummyInput()
        .appendField("title")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['title']), "title");
    this.appendStatementInput("question_list")
        .appendField("questions")
	     .setCheck(Blockly.FAQ.faqConnectors);
    this.setPreviousStatement(true, Blockly.FAQ.faqConnectors);
    this.setNextStatement(true, Blockly.FAQ.faqConnectors);
    this.setTooltip('');
  }
};

Blockly.Blocks['question_single'] = {
  init: function() {
	this.defaultValues = { title: "title" };
    this.setHelpUrl(Blockly.FAQ.helpLink + "#question_single");
    this.setColour(320);
    this.appendDummyInput()
        .appendField("single");
    this.appendDummyInput()
        .appendField("id")
        .appendField(new Blockly.FieldTextInput(AAANextId(this, "q"), AAAValidateId), "id");
    this.appendDummyInput()
        .appendField("title")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['title']), "title");
    this.appendDummyInput()
        .appendField("append answer?")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "append");
    this.appendValueInput("the_answer")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("answer");
    this.setPreviousStatement(true, Blockly.FAQ.faqConnectors);
    this.setNextStatement(true, Blockly.FAQ.faqConnectors);
    this.setTooltip('');
	
  }
};

Blockly.Blocks['question_link'] = {
  init: function() {
	this.defaultValues = { id: "id" };
    this.setHelpUrl(Blockly.FAQ.helpLink + "#question_link");
    this.setColour(300);
    this.appendDummyInput()
        .appendField("link to a question");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("question id")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['id']), "id");
    this.setPreviousStatement(true, Blockly.FAQ.faqConnectors);
    this.setNextStatement(true, Blockly.FAQ.faqConnectors);
    this.setTooltip('');
  }
};




Blockly.Blocks['answer'] = {
  init: function() {
  	this.defaultValues = { answer: "an answer" };
    this.setHelpUrl(Blockly.FAQ.helpLink + "#answer");
    this.setColour(160);
    this.appendDummyInput()
        .appendField("answer")
        .appendField(new Blockly.FieldTextAreaInput(this.defaultValues['answer'], FAQ.editAnswer), "the_answer");
    this.setInputsInline(true);
    this.setOutput(true, "answer");
    this.setTooltip('');
  }
};

Blockly.Blocks['answer_link'] = {
  init: function() {
  	this.defaultValues = { answer_url: "http://example.com", title: "title" };

    this.setHelpUrl(Blockly.FAQ.helpLink + "#answer_link");
    this.setColour(140);
    this.appendDummyInput()
        .appendField("link to web page");
    this.appendDummyInput()
        .appendField("title")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['title']), "title");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("url")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['answer_url']), "answer_url");
    this.setOutput(true, 'answer');
    this.setTooltip('');
  }
};


Blockly.Blocks['answer_iframe'] = {
  init: function() {
  	this.defaultValues = { answer_url: "http://example.com", title: "title", frame_width: "100%", frame_height: "400px" };

    this.setHelpUrl(Blockly.FAQ.helpLink + "#answer_iframe");
    this.setColour(140);
    this.appendDummyInput()
        .appendField("embedded answer");
    this.appendDummyInput()
        .appendField("url")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['answer_url']), "answer_url");
    this.appendDummyInput()
        .appendField("frame width")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['frame_width']), "frame_width");
    this.appendDummyInput()
        .appendField("frame height")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['frame_height']), "frame_height");
    this.setOutput(true, 'answer');
    this.setTooltip('');
  }
};


Blockly.Blocks['answer_question'] = {
  init: function() {
    this.setHelpUrl(Blockly.FAQ.helpLink + "#answer_question");
    this.setColour(120);
    this.appendDummyInput()
        .appendField("more questions");
    this.appendStatementInput("question_list")
        .appendField("questions")
	     .setCheck(Blockly.FAQ.faqConnectors);
    this.setOutput(true, 'answer');
    this.setTooltip('');
  }
};





