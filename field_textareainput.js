/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview TextArea input field.
 * @author fraser@google.com (Neil Fraser)
 * @author dave@optiga.com (Dave Klein)  converted field_textinput.js to field_textareainput.js
 */
'use strict';

goog.provide('Blockly.FieldTextAreaInput');

goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.userAgent');


/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function} opt_changeHandler An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextAreaInput = function(text, opt_onEdit, opt_changeHandler) {
  Blockly.FieldTextAreaInput.superClass_.constructor.call(this, text);

  this.onEdit = opt_onEdit;
  this.changeHandler_ = opt_changeHandler;
};
goog.inherits(Blockly.FieldTextAreaInput, Blockly.Field);

/**
 * Clone this FieldTextAreaInput.
 * @return {!Blockly.FieldTextAreaInput} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldTextAreaInput.prototype.clone = function() {
  return new Blockly.FieldTextAreaInput(this.getText(), this.changeHandler_);
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTextAreaInput.prototype.CURSOR = 'text';

/**
 * Dispose of all DOM objects belonging to this editable field.
 */
Blockly.FieldTextAreaInput.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfField(this);
  Blockly.FieldTextAreaInput.superClass_.dispose.call(this);
};

/**
 * Set the text in this field.
 * @param {?string} text New text.
 * @override
 */
Blockly.FieldTextAreaInput.prototype.setText = function(text, rawText) {
  if (text === null) {
    // No change if null.
    return;
  }
 if (typeof rawText === 'undefined')
 {
   rawText = text;
   var tmp = document.createElement("DIV");
   tmp.innerHTML = text;
   text = tmp.textContent || tmp.innerText || "";
 }
  if (this.changeHandler_) {
    var validated = this.changeHandler_(rawText);
    // If the new text is invalid, validation returns null.
    // In this case we still want to display the illegal result.
    if (validated !== null && validated !== undefined) {
      rawText = validated;
    }
  }
  this.setTextFinish(text, rawText);
};

// copied from Blockly.Field.prototype.setText and changed to only show substring of text
Blockly.FieldTextAreaInput.prototype.setTextFinish = function(a, rawText) {
    if (typeof rawText === 'undefined')
	{
	   rawText = a;
	}
    null !== rawText && rawText !== this.text_ && (this.text_ = rawText, goog.dom.removeChildren(this.textElement_), a = a.replace(/\s/g, Blockly.Field.NBSP), a || (a = Blockly.Field.NBSP), a.length > 50 ? a=a.substring(0,50) + '...' : a=a, a = document.createTextNode(a), this.textElement_.appendChild(a), this.size_.width = 0, this.sourceBlock_ && this.sourceBlock_.rendered && (this.sourceBlock_.render(), this.sourceBlock_.bumpNeighbours_(), this.sourceBlock_.workspace.fireChangeEvent()))
};

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldTextAreaInput.prototype.showEditor_ = function() {
  if (goog.userAgent.MOBILE) {
    // Mobile browsers have issues with in-line textareas (focus & keyboards).
    var newValue = window.prompt(Blockly.Msg.CHANGE_VALUE_TITLE, this.text_);
    if (this.changeHandler_) {
      var override = this.changeHandler_(newValue);
      if (override !== undefined) {
        newValue = override;
      }
    }
    if (newValue !== null) {
      this.setText(newValue);
    }
    return;
  }

  Blockly.WidgetDiv.show(this, this.dispose_());
  var div = Blockly.WidgetDiv.DIV;
  
  if (typeof this.onEdit !== 'undefined')
  {
     this.onEdit(this, this.text_);
  } else {
	  // Create the input.
	  var htmlInput = goog.dom.createDom('textarea', 'blocklyHtmlInput');
	  Blockly.FieldTextAreaInput.htmlInput_ = htmlInput;
	  
	  htmlInput.style.backgroundColor = '#cdc';
	  htmlInput.style.width="400px";
	  
	  div.appendChild(htmlInput);

	  htmlInput.value = htmlInput.defaultValue = this.text_;
	  htmlInput.oldValue_ = null;
	  this.validate_();
	  this.resizeEditor_();
	  htmlInput.focus();
	  htmlInput.select();

	  // Bind to keyup -- trap Enter and Esc; resize after every keystroke.
	  htmlInput.onKeyUpWrapper_ =
		  Blockly.bindEvent_(htmlInput, 'keyup', this, this.onHtmlInputChange_);
	  // Bind to keyPress -- repeatedly resize when holding down a key.
	  htmlInput.onKeyPressWrapper_ =
		  Blockly.bindEvent_(htmlInput, 'keypress', this, this.onHtmlInputChange_);
	  var workspaceSvg = this.sourceBlock_.workspace.getCanvas();
	  htmlInput.onWorkspaceChangeWrapper_ =
		  Blockly.bindEvent_(workspaceSvg, 'blocklyWorkspaceChange', this,
		  this.resizeEditor_);
  }
};

/**
 * Handle a change to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextAreaInput.prototype.onHtmlInputChange_ = function(e) {
  var htmlInput = Blockly.FieldTextAreaInput.htmlInput_;
 /* if (e.keyCode == 13) {
    // Enter
 //   Blockly.WidgetDiv.hide();
  } else */if (e.keyCode == 27) {
    // Esc
   // this.setText(htmlInput.defaultValue);
    Blockly.WidgetDiv.hide();
  } else {
    // Update source block.
    var text = htmlInput.value;
    if (text !== htmlInput.oldValue_) {
      htmlInput.oldValue_ = text;
      this.setText(text, text);
      this.validate_();
    } else if (goog.userAgent.WEBKIT) {
      // Cursor key.  Render the source block to show the caret moving.
      // Chrome only (version 26, OS X).
      this.sourceBlock_.render();
    }
  }
};

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
Blockly.FieldTextAreaInput.prototype.validate_ = function() {
  var valid = true;
  goog.asserts.assertObject(Blockly.FieldTextAreaInput.htmlInput_);
  var htmlInput = /** @type {!Element} */ (Blockly.FieldTextAreaInput.htmlInput_);
  if (this.changeHandler_) {
    valid = this.changeHandler_(htmlInput.value);
  }
  if (valid === null) {
    Blockly.addClass_(htmlInput, 'blocklyInvalidInput');
  } else {
    Blockly.removeClass_(htmlInput, 'blocklyInvalidInput');
  }
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
Blockly.FieldTextAreaInput.prototype.resizeEditor_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var bBox = this.fieldGroup_.getBBox();
  ///div.style.width = bBox.width + 'px';
  var xy = Blockly.getAbsoluteXY_((this.borderRect_));
  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.

  if (Blockly.RTL) {
    var borderBBox = this.borderRect_.getBBox();
    xy.x += borderBBox.width;
    xy.x -= div.offsetWidth;
  }
  // Shift by a few pixels to line up exactly.
  xy.y += 1;
  if (goog.userAgent.WEBKIT) {
    xy.y -= 3;
  }
  div.style.left = xy.x + 'px';
  div.style.top = xy.y + 'px';
  
  
    var htmlInput = /** @type {!Element} */ (Blockly.FieldTextAreaInput.htmlInput_);
  var lines = htmlInput.value.split('\n');
  if (htmlInput.rows < (lines.length+3))
  {
    htmlInput.rows = lines.length+3;
  }


};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTextAreaInput.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    var htmlInput = Blockly.FieldTextAreaInput.htmlInput_;
	if (typeof htmlInput !== 'undefined' && htmlInput !== null)
	{
		var text;
		// Save the edit (if it validates).
		text = htmlInput.value;
		if (thisField.changeHandler_) {
		  text = thisField.changeHandler_(text);
		  if (text === null) {
			// Invalid edit.
			text = htmlInput.defaultValue;
		  }
		}
		thisField.setText(text);
		thisField.sourceBlock_.render();
		Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
		Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
		Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
		Blockly.FieldTextAreaInput.htmlInput_ = null;
	}
  };
};

/**
 * Ensure that only a number may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid number, or null if invalid.
 */
Blockly.FieldTextAreaInput.numberValidator = function(text) {
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  text = text.replace(/O/ig, '0');
  // Strip out thousands separators.
  text = text.replace(/,/g, '');
  var n = parseFloat(text || 0);
  return isNaN(n) ? null : String(n);
};

/**
 * Ensure that only a nonnegative integer may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid int, or null if invalid.
 */
Blockly.FieldTextAreaInput.nonnegativeIntegerValidator = function(text) {
  var n = Blockly.FieldTextAreaInput.numberValidator(text);
  if (n) {
    n = String(Math.max(0, Math.floor(n)));
  }
  return n;
};
