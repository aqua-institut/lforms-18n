import { InternalUtil } from '../../lib/lforms/internal-utils.js';
import {importFHIRQuantity} from './import-common.js';
const fhirpath = require('fhirpath');

/**
 *  Defines SDC import functions that are the same across the different FHIR
 *  versions.  The function takes SDC namespace object defined in the sdc export
 *  code, and adds additional functions to it.
 */
function addCommonSDCImportFns(ns) {
"use strict";

  var self = ns;

  var errorMessages = LForms.Util._internalUtil.errorMessages;

  // FHIR extension urls
  self.fhirExtUrlCardinalityMin = "http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs";
  self.fhirExtUrlCardinalityMax = "http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs";
  self.fhirExtUrlItemControl = "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl";
  self.fhirExtUrlUnit = "http://hl7.org/fhir/StructureDefinition/questionnaire-unit";
  self.fhirExtUrlUnitOption = "http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption";
  self.fhirExtUrlOptionPrefix = "http://hl7.org/fhir/StructureDefinition/questionnaire-optionPrefix";
  self.fhirExtVariable = "http://hl7.org/fhir/StructureDefinition/variable";
  self.fhirExtUrlMinValue = "http://hl7.org/fhir/StructureDefinition/minValue";
  self.fhirExtUrlMaxValue = "http://hl7.org/fhir/StructureDefinition/maxValue";
  self.fhirExtUrlMinLength = "http://hl7.org/fhir/StructureDefinition/minLength";
  self.fhirExtUrlRegex = "http://hl7.org/fhir/StructureDefinition/regex";
  self.fhirExtUrlAnswerRepeats = "http://hl7.org/fhir/StructureDefinition/questionnaire-answerRepeats";
  self.fhirExtUrlExternallyDefined = "http://lhcforms.nlm.nih.gov/fhir/StructureDefinition/questionnaire-externallydefined";
  self.argonautExtUrlExtensionScore = "http://fhir.org/guides/argonaut-questionnaire/StructureDefinition/extension-score";
  self.fhirExtUrlHidden = "http://hl7.org/fhir/StructureDefinition/questionnaire-hidden";
  self.fhirExtTerminologyServer = "http://hl7.org/fhir/StructureDefinition/preferredTerminologyServer";
  self.fhirExtUrlDataControl = "http://lhcforms.nlm.nih.gov/fhirExt/dataControl";
  self.fhirExtCalculatedExp = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression";
  self.fhirExtInitialExp = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression";
  self.fhirExtObsLinkPeriod = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationLinkPeriod";
  self.fhirExtObsExtract = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract';
  self.fhirExtObsExtractCategory =
    "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observation-extract-category";
  self.fhirExtAnswerExp = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression";
  self.fhirExtEnableWhenExp = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression";
  self.fhirExtChoiceOrientation = "http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation";
  self.fhirExtLaunchContext = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext";
  self.fhirExtMaxSize = "http://hl7.org/fhir/StructureDefinition/maxSize";
  self.fhirExtMimeType = "http://hl7.org/fhir/StructureDefinition/mimeType";
  self.fhirExtUnitOpen = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-unitOpen";
  self.fhirExtUnitSuppSystem = "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-unitSupplementalSystem";
  self.fhirExtEntryFormat = "http://hl7.org/fhir/StructureDefinition/entryFormat";
  self.fhirExtUrlMaxDecimalPlaces = "http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces";
  self.fhirExtUrlOptionScoreLookup = {
    'STU3': "http://hl7.org/fhir/StructureDefinition/questionnaire-ordinalValue",
    'R4': "http://hl7.org/fhir/StructureDefinition/ordinalValue",
    'R5': "http://hl7.org/fhir/StructureDefinition/itemWeight"
  };
  self.fhirExtUrlOptionScoreUrlSet = new Set(Object.values(self.fhirExtUrlOptionScoreLookup));

  self.fhirExtUrlRestrictionArray = [
    self.fhirExtUrlMinValue,
    self.fhirExtUrlMaxValue,
    self.fhirExtUrlMinLength,
    self.fhirExtUrlRegex,
    self.fhirExtUrlMaxDecimalPlaces
  ];

  // One way or the other, the following extensions are converted to lforms internal fields.
  // Any extensions not listed here will be copied over to lforms as is, unless it has an
  // entry in extensionHandlers that does not return true (meaning specifically not to copy).
  self.handledExtensionSet = new Set([
    self.fhirExtUrlCardinalityMin,
    self.fhirExtUrlCardinalityMax,
    self.fhirExtUrlItemControl,
    self.fhirExtUrlUnit,
    self.fhirExtUrlUnitOption,
    self.fhirExtUrlOptionPrefix,
    self.fhirExtUrlMinValue,
    self.fhirExtUrlMaxValue,
    self.fhirExtUrlMinLength,
    self.fhirExtUrlRegex,
    self.fhirExtUrlAnswerRepeats,
    self.argonautExtUrlExtensionScore,
    self.fhirExtUrlHidden,
    self.fhirExtTerminologyServer,
    self.fhirExtUrlDataControl,
    self.fhirExtChoiceOrientation,
    self.fhirExtUrlMaxDecimalPlaces
  ]);

  // Simple functions for mapping extensions to properties in the internal structure.
  // Parameters:
  //   extension: the FHIR extension object
  //   item:  The LForms item to be updated
  // Returns:  true if the extension should still be added to the LForms item
  //   extension array, and false/undefined otherwise.
  //
  self.extensionHandlers = {};
  self.extensionHandlers[self.fhirExtMaxSize] = function(extension, item) {
    item.maxAttachmentSize = extension.valueDecimal || extension.valueInteger; // not sure why it is decimal
  };
  self.extensionHandlers[self.fhirExtMimeType] = function(extension, item) {
    item.allowedAttachmentTypes || (item.allowedAttachmentTypes = []);
    item.allowedAttachmentTypes.push(extension.valueCode);
  };
  self.extensionHandlers[
    "http://hl7.org/fhir/StructureDefinition/questionnaire-initialExpression"] = function(extension, item) {
    // Update the URI to the current one.
    extension.url = self.fhirExtInitialExp;
    return true; // add extension to LForms item
  };
  // Below are two old, deprecated terminology server urls.
  self.extensionHandlers[
    "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer"] =
  self.extensionHandlers[
    "http://hl7.org/fhir/StructureDefinition/terminology-server"] = function(extension, item) {
    extension.url = self.fhirExtTerminologyServer;
  };
  self.extensionHandlers[self.fhirExtUnitOpen] = function(extension, item) {
    item._unitOpen = extension.valueCode;
  }
  self.extensionHandlers[self.fhirExtUnitSuppSystem] = function(extension, item) {
    item._unitSuppSystem = extension.valueCanonical;
  }

  self.extensionHandlers[self.fhirExtUrlExternallyDefined] =  // (also handle old URL below)
  self.extensionHandlers["http://hl7.org/fhir/StructureDefinition/questionnaire-externallydefined"] =
  function(extension, item) {
    if (extension.valueUri) {
      item.externallyDefined = extension.valueUri;
    }
  }

  self.extensionHandlers[self.fhirExtEntryFormat] = function (extension, item) {
    if (extension.valueString) {
      item._entryFormat = extension.valueString;
      return true; // add extension to LForms item
    }
  }

  self.formLevelFields = [
    // Resource
    'id',
    'meta',
    'implicitRules',
    'language',


    // Domain Resource
    'text',
    'contained',
    'extension',
    'modifiedExtension',

    // Questionnaire
    'date',
    'version',
    'identifier',
    'code',  // code in FHIR clashes with previous definition in lforms. It needs special handling.
    'subjectType',
    'derivedFrom', // New in R4
    'status',
    'experimental',
    'publisher',
    'contact',
    'description',
    'useContext',
    'jurisdiction',
    'purpose',
    'approvalDate',
    'reviewDate',
    'effectivePeriod',
    'url'
  ];

  // Item-level fields that are simply copied from the FHIR Questionnaire format to the LHC-Forms format, and back.
  self.itemLevelIgnoredFields = [
    'definition',
    'id'
  ];

  /**
   * Convert FHIR SQC Questionnaire to LForms definition
   *
   * @param fhirData - FHIR Questionnaire object
   * @param options - LForms options object
   * @returns {{}} - LForms json object
   */
  self.convertQuestionnaireToLForms = function (fhirData, options) {
    var target = null;
    if (options)
      self._widgetOptions = options;

    if(fhirData) {
      target = LForms.Util.baseFormDef();
      self._processFormLevelFields(target, fhirData);
      var containedVS = self._extractContainedVS(fhirData);
      var containedImages = self.buildContainedImageMap(fhirData.contained);

      if(fhirData.item && fhirData.item.length > 0) {
        var linkIdItemMap = self._createLinkIdItemMap(fhirData);
        target.items = [];
        for( var i = 0; i < fhirData.item.length; i++) {
          var item = self._processQuestionnaireItem(fhirData.item[i], containedVS, linkIdItemMap, containedImages);
          // no instructions on the questionnaire level
          target.items.push(item);
        }
      }
      target.fhirVersion = self.fhirVersion;
    }
    return target;
  };


  /**
   * Parse form level fields from FHIR questionnaire and assign to LForms object.
   *
   * @param lfData - LForms object to assign the extracted fields
   * @param questionnaire - FHIR questionnaire resource object to parse for the fields.
   * @private
   */
  self._processFormLevelFields = function(lfData, questionnaire) {
    self.copyFields(questionnaire, lfData, self.formLevelFields);
    self._processExtensions(lfData, questionnaire);
    self._processTerminologyServer(lfData, questionnaire);

    // Handle title and name.  In LForms, "name" is the "title", but FHIR
    // defines both.
    lfData.shortName = questionnaire.name; // computer friendly
    lfData.name = questionnaire.title;

    // Handle extensions on title
    if (questionnaire._title)
      lfData.obj_title = questionnaire._title;

    // For backward compatibility, we keep lforms.code as it is, and use lforms.codeList
    // for storing questionnaire.code. While exporting, merge lforms.code and lforms.codeList
    // into questionnaire.code. While importing, convert first of questionnaire.code
    // as lforms.code, and copy questionnaire.code to lforms.codeList.
    if(questionnaire.code && questionnaire.code.length > 0) {
      // Rename questionnaire code to codeList
      lfData.codeList = questionnaire.code;
    }

    // copy over the copyright
    if (questionnaire.copyright) {
      lfData.copyrightNotice = questionnaire.copyright;
    }

    var codeAndSystemObj = self._getCode(questionnaire);
    if(codeAndSystemObj) {
      lfData.code = codeAndSystemObj.code;
      lfData.codeSystem = codeAndSystemObj.system;
    }
  };


  /**
   * Process questionnaire item recursively
   *
   * @param qItem - item object as defined in FHIR Questionnaire.
   * @param containedVS - contained ValueSet info, see _extractContainedVS() for data format details
   * @param linkIdItemMap - Map of items from link ID to item from the imported resource.
   * @param containedImages - contained images info, see buildContainedImageMap() for details.
   * @returns {{}} - Converted 'item' field object as defined by LForms definition.
   * @private
   */
  self._processQuestionnaireItem = function (qItem, containedVS, linkIdItemMap, containedImages) {

    var targetItem = {};
    //A lot of parsing depends on data type. Extract it first.
    self._processExtensions(targetItem, qItem);
    self._processDataType(targetItem, qItem);
    if (self._processAnswerConstraint) self._processAnswerConstraint(targetItem, qItem);
    self._processTextAndPrefix(targetItem, qItem);
    self._processCodeAndLinkId(targetItem, qItem);
    self._processDisplayItemCode(targetItem, qItem);
    self._processEditable(targetItem, qItem);
    self._processFHIRQuestionAndAnswerCardinality(targetItem, qItem);
    self._processDisplayControl(targetItem, qItem);
    self._processDataControl(targetItem, qItem);
    self._processRestrictions(targetItem, qItem);
    self._processHiddenItem(targetItem, qItem);
    self._processUnitList(targetItem, qItem);
    self._processAnswers(targetItem, qItem, containedVS, containedImages);
    self._processDefaultAnswer(targetItem, qItem);
    self._processTerminologyServer(targetItem, qItem);
    self._processSkipLogic(targetItem, qItem, linkIdItemMap);
    self.copyFields(qItem, targetItem, self.itemLevelIgnoredFields);
    self._processChildItems(targetItem, qItem, containedVS, linkIdItemMap, containedImages);
    if (self._processDisabledDisplay) self._processDisabledDisplay(targetItem, qItem);

    return targetItem;
  };


  /**
   *  Returns the number of sinificant digits in the number after, ignoring
   *  trailing zeros.  (I am including this on "self" so we can have tests for it.)
   */
  self._significantDigits = function(x) {
    // Based on https://stackoverflow.com/a/9539746/360782
    // Make sure it is a number and use the builtin number -> string.
    var s = "" + (+x);
    // The following RegExp include the exponent, which we don't need
    //var match = /(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(s);
    var match = /(\d+)(?:\.(\d+))?/.exec(s);
    // NaN or Infinity or integer.
    // We arbitrarily decide that Infinity is integral.
    if (!match) { return 0; }
    var wholeNum = match[1];
    var fraction = match[2];
    //var exponent = match[3];
    return wholeNum === '0' ? 0 : wholeNum.length + (fraction ? fraction.length : 0);
  };


  /**
   *  Imports an observation's values into the given LForms item.
   * @param lfItem the LForms item to which a value will be assigned.
   * @param obs the observation whose value will be assigned to lfItem.  It
   *  assumed that obs has an appropriate data type for its value.
   */
  self.importObsValue = function(lfItem, obs) {
    // Get the value from obs, based on lfItem's data type.  (The alternative
    // seems to be looping through the keys on obs looking for something that
    // starts with "value".
    var val = null;
    var lfDataType = lfItem.dataType;
    var fhirValType = this._lformsTypesToFHIRFields[lfDataType];
    // fhirValType is now the FHIR data type for a Questionnaire.  However,
    // where Questionnaire uses Coding, Observation uses CodeableConcept.
    if (fhirValType === 'Coding')
      fhirValType = 'CodeableConcept';
    if (fhirValType)
      val = obs['value'+fhirValType];
    if (!val && (lfDataType === 'REAL' || lfDataType === 'INT')) {
      // Accept initial value of type Quantity for these types.
      val = obs.valueQuantity;
      if (val)
        val._type = 'Quantity';
    }

    if (val) {
      if (!val._type && typeof val === 'object')
        val._type = fhirValType;

      // Before importing, confirm val contains a valid unit from the
      // item's unit list.
      var unitOkay = true;
      if (val._type === 'Quantity') {
        if (lfItem.units) {
          var matchingUnit;
          var valSystem = val.system;
          // On SMART sandbox, val.system might have a trailing slash (which is wrong, at least
          // for UCUM).  For now, just remove it.
          if (valSystem && valSystem[valSystem.length - 1] === '/')
            valSystem = valSystem.slice(0, -1);
          var isUCUMUnit = valSystem === self.UCUM_URI;
          var ucumUnit;
          for (var i=0, len=lfItem.units.length; i<len && !matchingUnit; ++i) {
            var lfUnit = lfItem.units[i];
            if (lfUnit.system && (lfUnit.system===valSystem && lfUnit.code===val.code) ||
                !lfUnit.system && (lfUnit.name===val.unit)) {
              matchingUnit = lfUnit;
            }
            if (isUCUMUnit && !matchingUnit && !ucumUnit && lfUnit.system === self.UCUM_URI)
              ucumUnit = lfUnit;
          }
          if (!matchingUnit && ucumUnit) {
            // See if we can convert to the ucumUnit we found
            var result = LForms.ucumPkg.UcumLhcUtils.getInstance().convertUnitTo(val.code, val.value, ucumUnit.code);
            if (result.status === 'succeeded') {
              matchingUnit = ucumUnit;
              // Round the result to the same number of significant digits as the
              // input value.
              var originalSD = this._significantDigits(val.value);
              if (originalSD > 0)
                val.value = parseFloat(result.toVal.toPrecision(originalSD));
              else
                val.value = result.toVal;
              val.code = ucumUnit.code;
              val.unit = ucumUnit.name || ucumUnit.code; // name can be undefined
            }
          }
          if (!matchingUnit)
            unitOkay = false;
          else
            lfItem.unit = matchingUnit;
        }
      }
      if (unitOkay) {
        this._processFHIRValues(lfItem, [val]);
      }
    }
  };


  /**
   *   Converts FHIR values to an LForms item values, but does not assign the
   *   values to the item.  (For a function that assigns values, call _processFHIRValues).
   *  @param lfItem the LForms item to for which these are new values
   *  @param fhirVals an array of FHIR values (e.g.  Quantity, Coding, string, etc.).
   *   Complex types like Quantity should have _type set to the type, if
   *   possible, or an attempt will be made to guess the FHIR type from the
   *   lfItem's data type.
   *  @param forDefault if true, the intented target of the values is the item's
   *   default value instead of the item value.
   *  @return an array of the processed/converted values, and an array of any error/warning/info
   *   messages for each of those messages.  For each item in the messages
   *   array, if there is a message there will be an object with keys "errors",
   *   "warnings", and "info" (if those exist), the values of which will will be
   *   an object with message ID keys (from error-messages.js) and message text
   *   values in the currently selected language.  Regarding the answers, note
   *   that Quantities will be returned as is, because those go into more than
   *   one field on the item, but some error checking will be done for them.
   */
  self._convertFHIRValues = function(lfItem, fhirVals, forDefault) {
    // Note that this is used by the import process, and so lfItem is an item
    // from the lforms definition object in that case, not an item from LFormsData.
    // On the other hand, it is also used by the ExpressionProcessor, an in that
    // case lfItem is an item from LFormsData.
    var lfDataType = lfItem.dataType;
    var answers = [];
    const messages = [];
    const types = fhirpath.types(fhirVals);
    for (let i=0, len=fhirVals.length; i<len; ++i) {
      let fhirVal = fhirVals[i];
      if (typeof fhirVal === 'object') {
        // types[i] is a string with a namespaced data type, such as
        // "FHIR.Quantity", "FHIR.date", "System.String"
        fhirVal._type = fhirVal._type || types[i]?.split('.')[1];
      }
      var answer = undefined; // reset back to undefined each iteration
      let errors = {};
      let hasMessages = false;
      if (InternalUtil.hasAnswerList(lfItem)) {
        if (lfDataType === "CODING" ) {
          var codings = null;
          if (fhirVal._type === 'CodeableConcept') {
            codings = fhirVal.coding;
          }
          else if (fhirVal._type === 'Coding' || typeof fhirVal === 'object') {
            codings = [fhirVal];
          }
          if (!codings) {
            // the value or the default value could be a string for optionsOrString
            if (lfItem.answerConstraint === 'optionsOrString') {
              answer = fhirVal;
            }
          }
          else {
            // Pick a Coding that is appropriate for this list item.
            // Note:  It could be an off list Coding.
            if (lfItem.answers) {
              var itemAnswers = lfItem.answers;
              for (var k=0, kLen=codings.length; k<kLen && !answer; ++k) {
                var coding = codings[k];
                for (var j=0, jLen=itemAnswers.length; j<jLen && !answer; ++j) {
                  var listAnswer = itemAnswers[j];
                  var listAnswerSystem = listAnswer.system ? LForms.Util.getCodeSystem(listAnswer.system) : null;
                  if ((!coding.system && !listAnswerSystem || coding.system === listAnswerSystem) &&
                      ((coding.hasOwnProperty('code') && listAnswer.hasOwnProperty('code') &&
                        coding.code===listAnswer.code) ||
                       (coding.hasOwnProperty('display') && listAnswer.hasOwnProperty('text') &&
                        coding.display === listAnswer.text))) {
                    answer = itemAnswers[j]; // include label in answer text
                  }
                }
              }
            }
            if (!answer && lfItem.answerConstraint === 'optionsOrString') { // no match in the list.
              answer = self._processCODINGValueInQR({valueCoding: fhirVal}, lfItem, true);
            }
          }
        }
        // answerOption is string, integer, date or time
        else if (lfItem.answers) {
          answer = self._processNonCodingAnswerValueInQR(fhirVal, lfItem, forDefault);
        }
      }
      else {
        if((lfDataType === 'QTY' || lfDataType === 'REAL' || lfDataType === 'INT') &&
            fhirVal._type === 'Quantity') {
          [answer, errors] = this._convertFHIRQuantity(lfItem, fhirVal);
          hasMessages = !!errors;
        }
        // For date types, convert them to date objects, but only for values.
        // If we're setting defaultAnswer, leave them as strings.
        else if (!forDefault && lfItem.dataType === 'DTM' && typeof fhirVal === 'string')
          answer = new Date(fhirVal);
        else if (!forDefault && lfItem.dataType === 'DT' && typeof fhirVal === 'string')
          answer = LForms.Util.stringToDTDateISO(fhirVal);
        else {
          answer = fhirVal;
        }
      }
      if (answer !== undefined || answer !== null)
          answers.push(answer);
      messages.push(hasMessages ? {errors} : null);
    }
    return [answers, messages];
  };


  /**
   *  Checks a FHIR Quantity for suitability for the given lfItem, converts
   *  its units as necessary, and sets error messages.
   * @param lfItem the LForms item to for which these are new values
   * @param quantity the FHIR Quantity value for the item
   * @param forDefault if true, the intented target of the values is the item's
   *  default value instead of the item value.
   * @return an array of two elements:  the processed/converted value (possibly
   *  null if there were an error), and an error/warning/info messages object
   *  (see _convertFHIRValues for the format) if there were messages.  In the
   *  case of an error, the converted value will be undefined.  Otherwise, the
   *  converted value will have fields for item.unit plus a 'value' field for
   *  the value.
   */
  self._convertFHIRQuantity = function(lfItem, quantity, forDefault) {
    let answer, errors;
    if (quantity.comparator !== undefined) {
      errors = {};
      errorMessages.addMsg(errors, 'comparatorInQuantity');
    }
    else {
      // The unit must match one of the provided units list, or be convertible
      // to such, unless the extensions unitOpen and unitSupplementalSystem are
      // specified. (These are R5 features, but we are including support for any
      // version.)

      if (!lfItem.units) {
        // In this case the quantity should not have a unit.
        if (quantity.unit) {
          errorMessages.addMsg(errors, 'nonMatchingQuantityUnit');
        }
        else
          answer = importFHIRQuantity(quantity);
      }
      else {
        // Try to find a matching unit
        var matchingUnit;
        var valSystem = quantity.system;
        // On SMART sandbox, quantity.system might have a trailing slash (which is wrong, at least
        // for UCUM).  For now, just remove it.
        if (valSystem && valSystem[valSystem.length - 1] === '/')
          valSystem = valSystem.slice(0, -1);
        var isUCUMUnit = valSystem === self.UCUM_URI;
        var ucumUnit;
        for (var i=0, len=lfItem.units.length; i<len && !matchingUnit; ++i) {
          var lfUnit = lfItem.units[i];
          if (lfUnit.system && (lfUnit.system===valSystem && lfUnit.code===quantity.code) ||
              !lfUnit.system && (lfUnit.name===quantity.unit)) {
            matchingUnit = lfUnit;
          }
          if (isUCUMUnit && !matchingUnit && !ucumUnit && lfUnit.system === self.UCUM_URI)
            ucumUnit = lfUnit;
        }
        quantity = LForms.Util.deepCopy(quantity); // so we don't change the input argument
        if (!matchingUnit && ucumUnit) {
          // See if we can convert to the ucumUnit we found
          var result = LForms.ucumPkg.UcumLhcUtils.getInstance().convertUnitTo(
            quantity.code, quantity.value, ucumUnit.code);
          if (result.status === 'succeeded') {
            matchingUnit = ucumUnit;
            // Round the result to the same number of significant digits as the
            // input value.
            var originalSD = this._significantDigits(quantity.value);
            if (originalSD > 0)
              quantity.value = parseFloat(result.toVal.toPrecision(originalSD));
            else
              quantity.value = result.toVal;
            quantity.code = ucumUnit.code;
            quantity.unit = ucumUnit.name || ucumUnit.code; // name can be undefined
          }
        }
        if (!matchingUnit) {
          if (lfItem._unitOpen == 'optionsOrString') {
            // Then accept the nonmatching unit, but only as a string
            delete quantity.code;
            delete quantity.system;
          }
          else if (!(lfItem._unitSuppSystem && lfItem._unitOpen == 'optionsOrType' &&
                   lfItem._unitSuppSystem == quantity.system)) {
            errors = {};
            errorMessages.addMsg(errors, 'nonMatchingQuantityUnit');
          }
        }
      }
      if (!errors) {
        answer = importFHIRQuantity(quantity);
      }
    }

    return [answer, errors];
  };


  /**
   *   Assigns FHIR values to an LForms item.
   *  @param lfItem the LForms item to receive the values from fhirVals
   *  @param fhirVals an array of FHIR values (e.g.  Quantity, Coding, string, etc.).
   *   Complex types like Quantity should have _type set to the type, if
   *   possible, or an attempt will be made to guess the FHIR type from the
   *   lfItem's data type.
   *  @param setDefault if true, the default value in lfItem will be set instead
   *   of the value.
   */
  self._processFHIRValues = function(lfItem, fhirVals, setDefault) {
    // Currently this is called for:
    //   - importing an Observation value (prepop) (a single value, but could
    //     have components referred to by child items)
    //   - processing default answers during an import.  For default answers, we
    //     do not assign the value here, but just put it in defaultAnswer.
    // Note that when importing, we are creating a LForms form definition, but
    // not and LFormsData object.
    let [answers, messages] = this._convertFHIRValues(lfItem, fhirVals, setDefault);
    let val = LForms.Util._hasMultipleAnswers(lfItem) ? answers : answers[0];
    if (setDefault) {
      lfItem.defaultAnswer = val;
      LForms.Util._internalUtil.setItemMessagesArray(lfItem, messages, 'default answers');
    }
    else {
      LForms.Util._internalUtil.assignValueToItem(lfItem, val);
      LForms.Util._internalUtil.setItemMessagesArray(lfItem, messages, '_processFHIRValues');
    }
  };


  /**
   * Get a FHIR value from an object given a partial string of hash key.
   * Use it where at most only one key matches.
   *
   * @param obj {object} - Object to search
   * @param keyRegex {regex} - Regular expression to match a key.  This should
   *  be the beginning part of the key up to the type (e.g., /^value/, to match
   *  "valueQuantity").
   * @returns {*} - Corresponding value of matching key.  For complex types,
   *  such as Quantity, the type of the returned object will be present under
   *  a _type attribute.
   * @private
   */
  self._getFHIRValueWithPrefixKey = function(obj, keyRegex) {
    var ret = null;
    if(typeof obj === 'object') {
      for(var key in obj) {
        var matchData = key.match(keyRegex);
        if (matchData) {
          ret = obj[key];
          if (ret && typeof ret === 'object') {
            ret = LForms.Util.deepCopy(ret); // Work with clone
            ret._type = key.substring(matchData[0].length);
          }
          break;
        }
      }
    }

    return ret;
  };


  /**
   *  Process the text and prefix data.
   * @param lfItem {object} - LForms item object to receive the data
   * @param qItem {object} - Questionnaire item object (as the source)
   */
  self._processTextAndPrefix = function(lfItem, qItem) {
    // prefix
    if (qItem.prefix)
      lfItem.prefix = qItem.prefix;
    // text
    lfItem.question = qItem.text;

    // process extensions on item._text and item._prefix
    for (let extField of ['_prefix', '_text']) {
      let itemAttr = 'obj' + extField;
      // copy over the extensions
      let extFieldData = qItem[extField];
      if (extFieldData)
        lfItem['obj'+extField] = extFieldData;

      let htmlAttrName = itemAttr == 'obj_text' ? '_displayTextHTML' : '_prefixHTML';
      let invalidFlagName = itemAttr == 'obj_text' ? '_hasInvalidHTMLTagInText' : '_hasInvalidHTMLTagInPrefix';

      // process rendering-xhtml extension
      const xhtmlFormat = lfItem[itemAttr] ?
          LForms.Util.findObjectInArray(lfItem[itemAttr].extension, 'url', "http://hl7.org/fhir/StructureDefinition/rendering-xhtml") : null;
      if (xhtmlFormat) {
        lfItem[htmlAttrName] = xhtmlFormat.valueString;
        if (self._widgetOptions?.allowHTML) {
          let invalidTagsAttributes = LForms.Util._internalUtil.checkForInvalidHtmlTags(xhtmlFormat.valueString);
          if (invalidTagsAttributes && invalidTagsAttributes.length>0) {
            lfItem[invalidFlagName] = true;
            let errors = {};
            errorMessages.addMsg(errors, 'invalidTagInHTMLContent');
            const messages = [{errors}];
            LForms.Util._internalUtil.printInvalidHtmlToConsole(invalidTagsAttributes);
            LForms.Util._internalUtil.setItemMessagesArray(lfItem, messages, '_processTextAndPrefix');
          }
        }
      }
    }
  };


  /**
   * Parse questionnaire item for code and code system
   * @param lfItem {object} - LForms item object to assign question code
   * @param qItem {object} - Questionnaire item object
   * @private
   */
  self._processCodeAndLinkId = function (lfItem, qItem) {
    if(qItem.code) {
      lfItem.codeList = qItem.code;
    }
    var code = self._getCode(qItem);
    if (code) {
      lfItem.questionCode = code.code;
      lfItem.questionCodeSystem = code.system;
    }
    // use linkId as questionCode, which should not be exported as code
    else {
      lfItem.questionCode = qItem.linkId;
      lfItem.questionCodeSystem = "LinkId";
    }

    lfItem.linkId = qItem.linkId;
  };


  /**
   * Parse questionnaire item for units list
   *
   * @param lfItem {object} - LForms item object to assign units
   * @param qItem {object} - Questionnaire item object
   * @private
   */
  self._processUnitList = function (lfItem, qItem) {

    var lformsUnits = [];
    var lformsDefaultUnit = null;
    // The questionnaire-unitOption extension is only for item.type = quantity
    var unitOption = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtUrlUnitOption, 0, true);
    if(unitOption && unitOption.length > 0) {
      if (qItem.type !== 'quantity') {
        throw new Error('The extension '+self.fhirExtUrlUnitOption+
          ' can only be used with type quantity.  Question "'+
          qItem.text+'" is of type '+qItem.type);
      }
      for(var i = 0; i < unitOption.length; i++) {
        var coding = unitOption[i].valueCoding;
        var lUnit = {
          name: coding.display,
          code: coding.code,
          system: coding.system
        };
        lformsUnits.push(lUnit);
      }
    }

    // The questionnaire-unit extension is only for item.type = integer or decimal
    var unit = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtUrlUnit);
    if (unit) {
      if (qItem.type !== 'integer' && qItem.type !== 'decimal') {
        throw new Error('The extension '+self.fhirExtUrlUnit+
          ' can only be used with types integer or decimal.  Question "'+
          qItem.text+'" is of type '+qItem.type);
      }
      lformsDefaultUnit = {
        name: unit.valueCoding.display,
        code: unit.valueCoding.code,
        system: unit.valueCoding.system,
        default: true
      };
      lformsUnits.push(lformsDefaultUnit);
    }

    if (qItem.type === 'quantity') {
      let initialQ = this.getFirstInitialQuantity(qItem);
      if (initialQ && initialQ.unit) {
        lformsDefaultUnit = LForms.Util.findItem(lformsUnits, 'name', initialQ.unit);
        if(lformsDefaultUnit) {
          lformsDefaultUnit.default = true;
        }
        else {
          lformsDefaultUnit = {
            name: initialQ.unit,
            code: initialQ.code,
            system: initialQ.system,
            default: true
          };
          lformsUnits.push(lformsDefaultUnit);
        }
      }
    }

    if(lformsUnits.length > 0) {
      if (!lformsDefaultUnit) {
        lformsUnits[0].default = true;
      }
      lfItem.units = lformsUnits;
    }
  };


  /**
   * Parse questionnaire item for display control
   *
   * @param lfItem {object} - LForms item object to assign display control
   * @param qItem {object} - Questionnaire item object
   * @private
   */
  self._processDisplayControl = function (lfItem, qItem) {
    var itemControlType = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtUrlItemControl);

    if(itemControlType) {
      var displayControl = {};
      switch (itemControlType.valueCodeableConcept.coding[0].code) {
        case 'Lookup': // backward-compatibility with old export
        case 'Combo-box': // backward-compatibility with old export
        case 'autocomplete':
          lfItem.isSearchAutocomplete = true;
          // continue to drop-down case
        case 'drop-down':
          displayControl.answerLayout = {type: 'COMBO_BOX'};
          break;
        case 'Checkbox': // backward-compatibility with old export
        case 'check-box':
        case 'Radio': // backward-compatibility with old export
        case 'radio-button':
          displayControl.answerLayout = {type: 'RADIO_CHECKBOX'};
          var answerChoiceOrientation = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtChoiceOrientation);
          if (answerChoiceOrientation) {
            if (answerChoiceOrientation.valueCode === "vertical") {
              displayControl.answerLayout.columns = "1"
            }
            else if (answerChoiceOrientation.valueCode === "horizontal") {
              displayControl.answerLayout.columns = "0"
            }
          }
          break;
        case 'Table': // backward-compatibility with old export
        case 'gtable':  // Not in STU3, but we'll accept it
          if(lfItem.dataType === 'SECTION') {
            displayControl.questionLayout = "horizontal";
          }
          break;
        case 'Matrix': // backward-compatibility with old export
        case 'table':
          if(lfItem.dataType === 'SECTION') {
            displayControl.questionLayout = "matrix";
          }
          break;
        default:
          displayControl = null;
      }

      if(displayControl && !LForms.jQuery.isEmptyObject(displayControl)) {
        lfItem.displayControl = displayControl;
      }
    }
  };


  /**
   * Parse questionnaire item for data control
   *
   * @param lfItem {object} - LForms item object to assign data control
   * @param qItem {object} - Questionnaire item object
   * @private
   */
  self._processDataControl = function (lfItem, qItem) {
    var dataControlType = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtUrlDataControl);

    if(dataControlType && dataControlType.valueString) {
      try {
        var dataControl = JSON.parse(dataControlType.valueString);
        if (dataControl) {
          lfItem.dataControl = dataControl;
        }
      }
      catch(e){
        console.log("Invalid dataControl data!");
      }
    }
  };


  /**
   * Parse questionnaire item for "hidden" extension
   *
   * @param lfItem {object} - LForms item object to be assigned the isHiddenInDef flag if the item is to be hidden.
   * @param qItem {object} - Questionnaire item object
   * @private
   * @return true if the item is hidden or if its ancestor is hidden, false otherwise
   */
  self._processHiddenItem = function(lfItem, qItem) {
    var ci = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtUrlHidden);
    if(ci) {
      lfItem.isHiddenInDef = typeof ci.valueBoolean === 'boolean'? ci.valueBoolean: ci.valueBoolean === 'true';
    }
    return lfItem.isHiddenInDef;
  };


  // ---------------- QuestionnaireResponse Import ---------------

  var qrImport = self._mergeQR = {};

  /**
   * Merge a QuestionnaireResponse instance into an LForms form object
   * @param formData an LForms form definition or LFormsData object.
   * @param qr a QuestionnaireResponse instance
   * @returns {{}} an updated LForms form definition, with answer data
   */
  qrImport.mergeQuestionnaireResponseToLForms = function(formData, qr) {
    if (!(formData instanceof LForms.LFormsData)) {
      // get the default settings in case they are missing in the form data
      // not to set item values by default values for saved forms with user data
      formData.hasSavedData = true;
      formData = (new LForms.LFormsData(formData)).getFormData();
    }
    // The reference to _mergeQR below is here because this function gets copied to
    // the containing object to be a part of the public API.
    var qrInfo = qrImport._getQRStructure(qr);
    qrImport._processQRItemAndLFormsItem(qrInfo, formData);
    return formData;
  };


  /**
   * Merge data into items on the same level
   * @param parentQRItemInfo structural information of a parent item
   * @param parentLFormsItem a parent item, could be a LForms form object or a form item object.
   * @private
   */
  qrImport._processQRItemAndLFormsItem = function(parentQRItemInfo, parentLFormsItem) {

    // note: parentQRItemInfo.qrItemInfo.length will increase when new data is inserted into the array
    for(var i=0; i<parentQRItemInfo.qrItemsInfo.length; i++) {

      var qrItemInfo = parentQRItemInfo.qrItemsInfo[i];
      var qrItem = qrItemInfo.item;
      if (qrItem) {
        // first repeating qrItem
        if (qrItemInfo.total > 1 && qrItemInfo.index === 0) {
          var defItem = this._findTheMatchingItemByLinkId(parentLFormsItem, qrItemInfo.linkId);
          // add repeating items in form data
          // if it is a case of repeating questions, not repeating answers
          if (ns._questionRepeats(defItem)) {
            this._addRepeatingItems(parentLFormsItem, qrItemInfo.linkId, qrItemInfo.total);
            // add missing qrItemInfo nodes for the newly added repeating LForms items (questions, not sections)
            if (defItem.dataType !== 'SECTION' && defItem.dataType !== 'TITLE') {
              for (var j=1; j<qrItemInfo.total; j++) {
                var newQRItemInfo = LForms.Util.deepCopy(qrItemInfo);
                newQRItemInfo.index = j;
                newQRItemInfo.item.answer = [newQRItemInfo.item.answer[j]];
                if(qrItemInfo.qrAnswersItemsInfo && qrItemInfo.qrAnswersItemsInfo[j]) {
                  newQRItemInfo.qrAnswersItemsInfo = [qrItemInfo.qrAnswersItemsInfo[j]];
                }
                parentQRItemInfo.qrItemsInfo.splice(i+j, 0, newQRItemInfo);
              }
              // change the first qr item's answer too
              qrItemInfo.item.answer = [qrItemInfo.item.answer[0]];
              if(qrItemInfo.qrAnswersItemsInfo && qrItemInfo.qrAnswersItemsInfo[0]) {
                qrItemInfo.qrAnswersItemsInfo = [qrItemInfo.qrAnswersItemsInfo[0]];
              }
              else {
                delete qrItemInfo.qrAnswersItemsInfo;
              }
            }
          }
          // reset the total number of questions when it is the answers that repeats
          else if (ns._answerRepeats(defItem)) {
            qrItemInfo.total = 1;
          }
        }
        // find the matching LForms item
        var item = this._findTheMatchingItemByLinkIdAndIndex(parentLFormsItem, qrItemInfo.linkId, qrItemInfo.index);

        // set up value and units if it is a question
        if ((item.dataType !== 'SECTION' && item.dataType !== 'TITLE')) {
          var qrAnswer = qrItem.answer;
          if (qrAnswer && qrAnswer.length > 0) {
            this._setupItemValueAndUnit(qrItem.linkId, qrAnswer, item);
            // process item.answer.item, if applicable
            if(qrItemInfo.qrAnswersItemsInfo) {
              // _setupItemValueAndUnit seems to assume single-answer except for multiple choices on CODING
              // moreover, each answer has already got its own item above if question repeats
              if(qrItemInfo.qrAnswersItemsInfo.length > 1) {
                throw new Error('item.answer.item with item.answer.length > 1 is not yet supported');
              }
              this._processQRItemAndLFormsItem(qrItemInfo.qrAnswersItemsInfo[0], item);
            }
          }
        }

        // process items on the sub-level
        if (qrItemInfo.qrItemsInfo && qrItemInfo.qrItemsInfo.length>0) {
          this._processQRItemAndLFormsItem(qrItemInfo, item);
        }
      }
    }
  };


  /**
   * Set value and units on a LForms item
   * @param linkId a QuestionnaireResponse item's linkId
   * @param answer value for the item in QuestionnaireResponse
   * @param item a LForms item
   * @private
   */
  qrImport._setupItemValueAndUnit = function(linkId, answer, item) {

    if (item && linkId === item.linkId && (item.dataType !== 'SECTION' && item.dataType !== 'TITLE')) {
      var dataType = item.dataType;

      // any one has a unit must be a numerical type, let use REAL for now.
      // dataType conversion should be handled when panel data are added to lforms-service.
      if ((!dataType || dataType==="ST") && item.units && item.units.length>0 ) {
        item.dataType = dataType = "REAL";
      }

      var qrValue = answer[0];

      switch (dataType) {
        case "BL":
          if (qrValue.valueBoolean === true || qrValue.valueBoolean === false) {
            item.value = qrValue.valueBoolean;
          }
          break;
        case "INT":
          // has an answer list
          if (InternalUtil.hasAnswerList(item)) {
            // answer repeats (autocomplete or checkboxes)
            ns._processOtherAnswerOptionValueInQR(answer, item)
          }
          // normal item
          else {
            if (qrValue.hasOwnProperty('valueQuantity')) {
              item.value = qrValue.valueQuantity.value;
              if(qrValue.valueQuantity.code) {
                item.unit = {name: qrValue.valueQuantity.code};
              }
            }
            else if (qrValue.hasOwnProperty('valueInteger')) {
              item.value = qrValue.valueInteger;
            }
          }
          break;
        case "REAL":
        case "QTY":
          if (qrValue.hasOwnProperty('valueQuantity')) {
            var quantity = qrValue.valueQuantity;
            var lformsQuantity = importFHIRQuantity(quantity);
            LForms.Util._internalUtil.assignValueToItem(item, lformsQuantity, 'Quantity');
          }
          else if (qrValue.hasOwnProperty('valueDecimal')) {
            item.value = qrValue.valueDecimal;
          }
          break;
        case "DT":
          // has an answer list
          if (InternalUtil.hasAnswerList(item)) {
            // answer repeats (autocomplete or checkboxes)
            ns._processOtherAnswerOptionValueInQR(answer, item)
          }
          // normal item
          else if (qrValue.hasOwnProperty('valueDate')) {
            item.value = qrValue.valueDate;
          }
          break;
        case "TM":
          // has an answer list
          if (InternalUtil.hasAnswerList(item)) {
            // answer repeats (autocomplete or checkboxes)
            ns._processOtherAnswerOptionValueInQR(answer, item)
          }
          // normal item
          else if (qrValue.hasOwnProperty('valueTime')) {
            item.value = qrValue.valueTime;
          }
          break;
        case "DTM":
          item.value = qrValue.valueDateTime;
          break;
        case "CODING":
          if (ns._answerRepeats(item)) {
            var value = [];
            for (var j=0,jLen=answer.length; j<jLen; j++) {
              var val = ns._processCODINGValueInQR(answer[j], item);
              if (val) {
                value.push(val);
              }
            }
            item.value = value;
          }
          else {
            var val = ns._processCODINGValueInQR(qrValue, item);
            if (val) {
              item.value = val;
            }
          }
          break;
        case "ST":
          // has an answer list
          if (InternalUtil.hasAnswerList(item)) {
            // answer repeats (autocomplete or checkboxes)
            ns._processOtherAnswerOptionValueInQR(answer, item)
          }
          // normal item
          else if (qrValue.hasOwnProperty('valueString')) {
              item.value = qrValue.valueString;
          }
          break;
        case "TX":
          item.value = qrValue.valueString;
          break;
        case "attachment":
          item.value = qrValue.valueAttachment;
          break;
        case "SECTION":
        case "TITLE":
        case "":
          // do nothing
          break;
        default:
          item.value = qrValue.valueString;
      }
    }
  }


  /**
   * Build a map of items to linkid from a questionnaire resource.
   * @param qResource - FHIR Questionnaire resource
   * @returns {*} - Hash object with link id keys pointing to their respective items.
   * @private
   */
  self._createLinkIdItemMap = function (qResource) {
    var traverse = function (itemArray, collection) {
        itemArray.forEach(function(item) {
          collection[item.linkId] = item;
          if(item.item) {
            traverse(item.item, collection);
          }
        });

      return collection;
    };

    var ret = {};
    if(qResource.item) {
      ret = traverse(qResource.item, ret);
    }
    return ret;
  };


  /**
   * Get an object with code and code system
   *
   * @param questionnaireItemOrResource {object} - question
   * @private
   */
  self._getCode = function (questionnaireItemOrResource) {
    var code = null;
    if(questionnaireItemOrResource &&
      Array.isArray(questionnaireItemOrResource.code) &&
      questionnaireItemOrResource.code.length) {
      code = {
        code: questionnaireItemOrResource.code[0].code,
        system: self._toLfCodeSystem(questionnaireItemOrResource.code[0].system)
      };
    }
    // If code is missing look for identifier.
    else if(questionnaireItemOrResource &&
      Array.isArray(questionnaireItemOrResource.identifier) &&
      questionnaireItemOrResource.identifier.length) {
      code = {
        code: questionnaireItemOrResource.identifier[0].value,
        system: self._toLfCodeSystem(questionnaireItemOrResource.identifier[0].system)
      };
    }

    return code;
  };


  /**
   * Convert the given code system to LForms internal code system. Currently
   * only converts 'http://loinc.org' to 'LOINC' and returns all other input as is.
   * @param codeSystem
   * @private
   */
  self._toLfCodeSystem = function(codeSystem) {
    var ret = codeSystem;
    switch(codeSystem) {
      case 'http://loinc.org':
        ret = 'LOINC';
        break;
    }

    return ret;
  };


  // Copy the main merge function to preserve the same API usage.
  self.mergeQuestionnaireResponseToLForms = qrImport.mergeQuestionnaireResponseToLForms;

  /**
   *  Processes the terminology server setting, if any.
   *
   * @param lfItem - LForms form or item object to receive the terminology
   *  server setting.
   * @param qItem - Questionnaire or Questionnaire item object
   * @private
   */
  self._processTerminologyServer = function (lfItem, qItem) {
    var tServer = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtTerminologyServer);
    if (tServer && tServer.valueUrl) {
      lfItem.terminologyServer = tServer.valueUrl;
    }
  };


  /**
   * Parse Questionnaire item for externallyDefined url
   *
   * @param lfItem - LForms item object to assign externallyDefined
   * @param qItem - Questionnaire item object
   * @private
   */
  self._processExternallyDefined = function (lfItem, qItem) {
    var externallyDefined = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtUrlExternallyDefined);
    if (externallyDefined && externallyDefined.valueUri) {
      lfItem.externallyDefined = externallyDefined.valueUri;
    }
  };


  /**
   *  Finds the terminology server URL (if any) for the given item.
   * @param item a question, title, or group in the form (in the LFormsData
   *  structure, not the Questionnaire).
   * @return the base terminology server URL, or undefined if there isn't one
   *  for this item.
   */
  self._getTerminologyServer = function(item) {
    var terminologyServer = item.terminologyServer;
    var parent = item._parentItem;
    while (!terminologyServer && parent) {
      terminologyServer = parent.terminologyServer;
      parent = parent._parentItem;
    }
    return terminologyServer;
  };


  /**
   *  Returns the URL for performing a ValueSet expansion for the given item,
   *  if the given item has a terminology server and answerValueSet
   *  configured; otherwise it returns undefined.
   * @param item a question, title, or group in the form
   */
  self._getExpansionURL = function(item) {
    var rtn;
    if (item.answerValueSet) {
      var terminologyServer = this._getTerminologyServer(item);
      if (terminologyServer)
        rtn = terminologyServer + '/ValueSet/$expand?url='+
          encodeURIComponent(item.answerValueSet) + '&_format=json';
    }
    return rtn;
  };

  /**
   *  Loads answerValueSets for prefetched lists.
   * @param lfData the LFormsData for the form
   * @return an array of promise objects which resolve when the answer valuesets
   * have been loaded and imported.
   */
  self.loadAnswerValueSets = function (lfData) {
    var pendingPromises = [];
    var items = lfData.itemList;
    for (var i = 0, len = items.length; i < len; ++i) {
      let item = items[i];
      let expURL, vsKey;
      // Skip over answerValueSet if item.answers is already present (e.g.,
      // loaded from a package (see lhc-form-data.ts: _loadAnswerValueSetsFromPackage).
      if (!item.answers && item.answerValueSet && !item.isSearchAutocomplete) {
        if (item.answerValueSet.startsWith('#')) {
          vsKey = item.answerValueSet;
        } else {
          expURL = this._getExpansionURL(item);
          vsKey = expURL ? expURL : item.answerValueSet;
        }
        if (!LForms._valueSetAnswerCache)
          LForms._valueSetAnswerCache = {};
        let answersOrPromise = LForms._valueSetAnswerCache[vsKey];
        if (answersOrPromise) {
          if (typeof answersOrPromise.then === 'function') { // A promise is cached but not yet returned.
            answersOrPromise.then(function (answers) {
              if (answers) {
                self._updateAnswersFromValueSetResponse(answers, lfData, item);
              }
              return answers;
            });
          } else { // answers list is cached.
            self._updateAnswersFromValueSetResponse(answersOrPromise, lfData, item);
          }
        } else { // if not already loaded
          if (item.answerValueSet.startsWith('#')) {
            self._expandContainedValueSet(lfData, item, pendingPromises);
          } else if (expURL) {
            const p = fetch(expURL, {headers: {'Accept': 'application/fhir+json'}}).then(function (response) {
              return response.json();
            }).then(function (parsedJSON) {
              if (parsedJSON.resourceType === "OperationOutcome") {
                var errorOrFatal = parsedJSON.issue.find(item => item.severity === "error" || item.severity === "fatal")
                if (errorOrFatal) {
                  let errors = {};
                  errorMessages.addMsg(errors, 'answerValueSetLoadingError');
                  const messages = [{errors}];
                  LForms.Util._internalUtil.setItemMessagesArray(item, messages, 'loadAnswerValueSets');
                  // Do not cache the result if expansion fails.
                  delete LForms._valueSetAnswerCache[vsKey];
                  throw new Error(errorOrFatal.diagnostics);
                }
              } else {
                var answers = self.answersFromVS(parsedJSON);
                if (answers) {
                  self._updateAnswersFromValueSetResponse(answers, lfData, item);
                  LForms._valueSetAnswerCache[vsKey] = answers;
                }
                return answers;
              }
            }).catch(function (error) {
              let errors = {};
              errorMessages.addMsg(errors, 'answerValueSetLoadingError');
              const messages = [{errors}];
              LForms.Util._internalUtil.setItemMessagesArray(item, messages, 'loadAnswerValueSets');
              const msg = `Unable to load ValueSet ${item.answerValueSet} from ${expURL}`;
              // Do not cache the result if expansion fails.
              delete LForms._valueSetAnswerCache[vsKey];
              throw new Error(msg);
            });
            pendingPromises.push(p);
            LForms._valueSetAnswerCache[vsKey] = p;
          } else { // use FHIR context
            var fhirClient = LForms.fhirContext?.client;
            if (!fhirClient) {
              const p = Promise.reject(new Error("Unable to load ValueSet "+item.answerValueSet+
              ".  A terminology server or a FHIR server is needed.  FHIR Questionnaires "+
              "can specify a preferred terminology server for loading value sets."));
              pendingPromises.push(p);
              // Cache the rejected Promise so the same vsKey don't need to be processed again,
              // and we return only one rejected promise for the same vsKey.
              LForms._valueSetAnswerCache[vsKey] = p;
            } else {
              const p = fhirClient.request({
                url: lfData._buildURL(
                  ['ValueSet', '$expand'], {url: item.answerValueSet, _format: 'json'}),
                headers: {'Accept': 'application/fhir+json'}
              }).then(function (response) {
                var valueSet = response;
                var answers = self.answersFromVS(valueSet);
                if (answers) {
                  self._updateAnswersFromValueSetResponse(answers, lfData, item);
                  LForms._valueSetAnswerCache[vsKey] = answers;
                }
                return answers;
              }).catch(function (error) {
                throw new Error("Unable to load ValueSet " + item.answerValueSet + " from FHIR server");
              });
              pendingPromises.push(p);
              LForms._valueSetAnswerCache[vsKey] = p;
            }
          }
        }
      }
    }
    return pendingPromises;
  };

  /**
   * Expands contained valueset against terminology server.
   * Here we take care of the scenario of contained valuesets without an expansion.
   * If the contained valueset had an expansion, the answers list would already have been set
   * on the item from _processAnswers(), while answerValueSet property would not have been set.
   * @param lfData the LFormsData for the form
   * @param item an item in ltemList
   * @param pendingPromises pending promises list for loading answerValueSets
   * @private
   */
  self._expandContainedValueSet = function (lfData, item, pendingPromises) {
    const containedVS = lfData.contained.find(x => x.resourceType === 'ValueSet' && x.id === item.answerValueSet.substring(1));
    const terminologyServer = this._getTerminologyServer(item);
    if (terminologyServer) {
      const p = fetch(terminologyServer + '/ValueSet/$expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(containedVS)
      }).then(function (response) {
        return response.json();
      }).then(function (parsedJSON) {
        if (parsedJSON.resourceType === "OperationOutcome") {
          var errorOrFatal = parsedJSON.issue.find(item => item.severity === "error" || item.severity === "fatal");
          if (errorOrFatal) {
            throw new Error(errorOrFatal.diagnostics);
          }
        } else {
          if (self._widgetOptions?.allowHTML) {
            self._copyExtensionsToExpansion(parsedJSON);
          }
          var answers = self.answersFromVS(parsedJSON);
          if (answers) {
            self._updateAnswersFromValueSetResponse(answers, lfData, item);
            LForms._valueSetAnswerCache[item.answerValueSet] = answers;
          }
          return answers;
        }
      }).catch(function (error) {
        throw new Error("Unable to load ValueSet from " + terminologyServer + " for contained ValueSet " + item.answerValueSet);
      });
      pendingPromises.push(p);
      LForms._valueSetAnswerCache[item.answerValueSet] = p;
    } else { // use FHIR context
      var fhirClient = LForms.fhirContext?.client;
      if (!fhirClient) {
        const p = Promise.reject(new Error('Cannot load ValueSet "'+
          item.answerValueSet+'" because it requires either a terminology '+
          'server to be specified or LForms.Util.setFHIRContext(...) '+
          'to have been called to provide access to a FHIR server.'
        ));
        pendingPromises.push(p);
        // Cache the rejected Promise so the same vsKey don't need to be processed again,
        // and we return only one rejected promise for the same vsKey.
        LForms._valueSetAnswerCache[item.answerValueSet] = p;
      } else {
        const p = fhirClient.request({
          url: 'ValueSet/$expand?_format=json',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(containedVS)
        }).then(function (parsedJSON) {
          if (self._widgetOptions?.allowHTML) {
            self._copyExtensionsToExpansion(parsedJSON);
          }
          var answers = self.answersFromVS(parsedJSON);
          if (answers) {
            self._updateAnswersFromValueSetResponse(answers, lfData, item);
            LForms._valueSetAnswerCache[item.answerValueSet] = answers;
          }
          return answers;
        }).catch(function (error) {
          throw new Error("Unable to load ValueSet " + item.answerValueSet + " from FHIR server");
        });
        pendingPromises.push(p);
        LForms._valueSetAnswerCache[item.answerValueSet] = p;
      }
    }
  };


  /**
   * Updates item.answers based on the response of the answerValueSet $expand operation.
   * @param answers answers list extracted from answersFromVS()
   * @param lfData the LFormsData for the form
   * @param item an item in ltemList
   * @private
   */
  self._updateAnswersFromValueSetResponse = function (answers, lfData, item) {
    item.answers = answers;
    lfData._updateAutocompOptions(item);
    lfData._resetItemValueWithAnswers(item);
  };


  /**
   * When we do an $expand POST operation, the returned expansion may not have the
   * rendering-xhtml on _display. compose.include.concept may have the extension. Copy
   * _display to expansion.contains if there are matches in comose.include.concept.
   * @param parsedJSON the returned JSON object from an $expand POST operation
   */
  self._copyExtensionsToExpansion = function (parsedJSON) {
    if (!parsedJSON.expansion?.contains || !parsedJSON.compose?.include) {
      return;
    }
    parsedJSON.expansion.contains.forEach(function (vsItem) {
      // compose.include should have a system, but if both systems are undefined, they are considered a match.
      const matchingSytem = parsedJSON.compose.include.find(include => include.system === vsItem.system);
      if (matchingSytem) {
        const matchingCode = matchingSytem.concept?.find(concept => concept.code === vsItem.code);
        if (matchingCode?._display) {
          vsItem._display = matchingCode._display;
        }
      }
    });
  };


  /**
   * Handle the item.value in QuestionnaireResponse for CODING typed items
   * @param qrItemValue a value of item in QuestionnaireResponse
   * @param lfItem an item in lforms
   * @param notOnList a flag indicates if the item's value is known to be not any of the answers
   * in the answer list. If false or undefined, a check of the answers will be made.
   * @returns {{code: *, text: *}}
   * @private
   */
  self._processCODINGValueInQR = function(qrItemValue, lfItem, notOnList) {
    var retValue;
    // a valueCoding, which is one of the answers
    if (qrItemValue.valueCoding) {
      var c = qrItemValue.valueCoding;
      retValue = {};
      if (c.code)
        retValue.code = c.code;
      if (c.display)
        retValue.text = c.display;
      if (c.system)
        retValue.system = c.system;


      if (notOnList) {
        retValue._notOnList = true;
      }
      // compare retValue to the item.answers
      // if not same, add "_notOnList: true" to retValue
      else if (lfItem.answerConstraint === 'optionsOrString' && lfItem.answers) {
        var found = false;
        for(var i=0, len=lfItem.answers.length; i<len; i++) {
          if (LForms.Util.areTwoAnswersSame(retValue, lfItem.answers[i], lfItem)) {
            found = true;
            break;
          }
        }
        if (!found) {
          retValue._notOnList = true;
        }
      }
    }
    // a valueString, which is a user supplied value that is not in the answers
    else if (qrItemValue.valueString && lfItem.answerConstraint === 'optionsOrString') {
      retValue = qrItemValue.valueString;
    }
    return retValue;
  };


  /**
   * Handle the item.value in QuestionnaireResponse for ST/INT/DT/TM typed items
   * that have an answer list.
   * @param {*} answer an answer of an item in QuestionnaireResponse
   * @param {*} lfItem an item in lforms
   * @returns
   */
  self._processOtherAnswerOptionValueInQR = function(answer, item) {

    // has an answer list
    if (InternalUtil.hasAnswerList(item)) {
      // answer repeats (autocomplete or checkboxes)
      if (ns._answerRepeats(item)) {
        var value = [];
        for (var j=0,jLen=answer.length; j<jLen; j++) {
          var val = ns._convertOtherAnswerOptionValueInQR(answer[j], item);
          if (val) {
            value.push(val);
          }
        }
        item.value = value;
      }
      // answer not repeats, (autocomplete or radiobuttons)
      else {
        item.value = ns._convertOtherAnswerOptionValueInQR(answer[0], item);
      }
    }
  }


  /**
   * Convert FHIR values in QuestionnaireResponse for ST/INT/DT/TM typed items
   * that have an answer list, to lforms values
   * @param {*} qrItemValue a value of item in QuestionnaireResponse
   * @param {*} lfItem an item in lforms
   * @returns
   */
  self._convertOtherAnswerOptionValueInQR = function(qrItemValue, lfItem) {
    let retValue;
    let dataType = lfItem.dataType;

    if (lfItem.answers && (dataType === "ST" || dataType === "INT" ||
        dataType === "DT" || dataType === "TM")) {
      let answerText;
      switch (dataType) {
        case "ST":
          answerText = qrItemValue.valueString;
          break;
        case "INT":
          answerText = qrItemValue.valueInteger;
          break;
        case "DT":
          answerText = qrItemValue.valueDate;
          break;
        case "TM":
          answerText = qrItemValue.valueTime;
          break;
      }
      if (answerText) {
        retValue = { text: answerText };
      }
      else if (lfItem.answerConstraint === "optionsOrString" && qrItemValue.valueString) {
        retValue = qrItemValue.valueString;
      }
    }

    return retValue; // retValue might not be in the answers? R5 allows that.
  };


  /**
   * Parse questionnaire item for coding instructions
   * @param targetItem the LForms node being populated with data
   * @param qItem {object} - Questionnaire item object
   * @return {boolean} true if the item is a help text item, false otherwise.
   * @private
   */
  self._processCodingInstructionsAndLegal = function(targetItem, qItem) {
    // if the qItem is a "display" typed item with a item-control extension, then it meant to be a help message,
    // which in LForms is an attribute of the parent item, not a separate item.
    // use one coding instruction if there are multiple ones in Questionnaire.
    let helpOrLegal, legal, errors, messages;
    let ci = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtUrlItemControl);
    let xhtmlFormat;
    if ( qItem.type === "display" && ci) {
      // true if it's a legal extension, false if it's a help extension.
      let isLegal = ci.valueCodeableConcept?.coding?.[0]?.code === 'legal';

      // only "rendering-xhtml" is supported. others are default to text
      if (qItem._text) {
        xhtmlFormat = LForms.Util.findObjectInArray(qItem._text.extension, 'url', "http://hl7.org/fhir/StructureDefinition/rendering-xhtml");
        const renderingStyle = LForms.Util.findObjectInArray(qItem._text.extension, 'url', "http://hl7.org/fhir/StructureDefinition/rendering-style");
        if (renderingStyle) {
          if (isLegal) {
            targetItem._obj_legalCSS = renderingStyle.valueString;
          } else {
            targetItem._obj_helpCSS = renderingStyle.valueString;
          }
        }
      }

      // there is a xhtml extension
      if (xhtmlFormat) {
        helpOrLegal = isLegal ? {
          legalFormat: "html",
          legal: xhtmlFormat.valueString,
          legalLinkId: qItem.linkId,
          legalPlain: qItem.text  // this always contains the legal in plain text
        } : {
          codingInstructionsFormat: "html",
          codingInstructions: xhtmlFormat.valueString,
          codingInstructionsLinkId: qItem.linkId,
          codingInstructionsPlain: qItem.text  // this always contains the coding instructions in plain text
        };
        // check if html string contains invalid html tags, when the html version needs to be displayed
        if (self._widgetOptions?.allowHTML) {
          let invalidTagsAttributes = LForms.Util._internalUtil.checkForInvalidHtmlTags(xhtmlFormat.valueString);
          if (invalidTagsAttributes && invalidTagsAttributes.length>0) {
            if (isLegal)
              helpOrLegal.legalHasInvalidHtmlTag = true;
            else
              helpOrLegal.codingInstructionsHasInvalidHtmlTag = true;
            errors = {};
            errorMessages.addMsg(errors, isLegal ? 'invalidTagInLegalHTMLContent' : 'invalidTagInHelpHTMLContent');
            messages = [{errors}];
            LForms.Util._internalUtil.printInvalidHtmlToConsole(invalidTagsAttributes);
          }
        }
      }
      // no xhtml extension, default to 'text'
      else {
        helpOrLegal = isLegal ? {
          legalFormat: "text",
          legal: qItem.text,
          legalinkId: qItem.linkId,
          legalPlain: qItem.text // this always contains the legal in plain text
        } : {
          codingInstructionsFormat: "text",
          codingInstructions: qItem.text,
          codingInstructionsLinkId: qItem.linkId,
          codingInstructionsPlain: qItem.text // this always contains the coding instructions in plain text
        };
      }

      if (messages) {
        LForms.Util._internalUtil.setItemMessagesArray(targetItem, messages, '_processCodingInstructionsAndLegal');
      }
      if (helpOrLegal) {
        if (isLegal) {
          targetItem.legal = helpOrLegal.legal;
          targetItem.legalFormat = helpOrLegal.legalFormat;
          targetItem.legalPlain = helpOrLegal.legalPlain;
          targetItem.legalHasInvalidHtmlTag = helpOrLegal.legalHasInvalidHtmlTag;
          targetItem.legalLinkId = helpOrLegal.legalLinkId;
        } else {
          targetItem.codingInstructions = helpOrLegal.codingInstructions;
          targetItem.codingInstructionsFormat = helpOrLegal.codingInstructionsFormat;
          targetItem.codingInstructionsPlain = helpOrLegal.codingInstructionsPlain;
          targetItem.codingInstructionsHasInvalidHtmlTag = helpOrLegal.codingInstructionsHasInvalidHtmlTag;
          targetItem.codingInstructionsLinkId = helpOrLegal.codingInstructionsLinkId;
        }
      }

      return !!helpOrLegal;
    }
  };


  /**
   *  Processes the child items of the item.
   * @param targetItem the LForms node being populated with data
   * @param qItem the Questionnaire (item) node being imported
   * @param linkIdItemMap - Map of items from link ID to item from the imported resource.
   * @param containedVS - contained ValueSet info, see _extractContainedVS() for data format details
   * @param containedImages - contained images info, see buildContainedImageMap() for details.
   */
  self._processChildItems = function(targetItem, qItem, containedVS, linkIdItemMap, containedImages) {
    if (Array.isArray(qItem.item)) {
      targetItem.items = [];
      for (var i=0; i < qItem.item.length; i++) {
        let isHelpTextItem = self._processCodingInstructionsAndLegal(targetItem, qItem.item[i]);
        if(!isHelpTextItem) {
          var item = self._processQuestionnaireItem(qItem.item[i], containedVS, linkIdItemMap, containedImages);
          targetItem.items.push(item);
        }
      }
    }
  };


  /**
   *  Copy extensions that haven't been handled before.
   *
   * @param lfItem the LForms node being populated with data
   * @param qItem the Questionnaire (item) node being imported
   */
  self._processExtensions = function(lfItem, qItem) {
    var extensions = [];
    if (Array.isArray(qItem.extension)) {
      for (var i=0; i < qItem.extension.length; i++) {
        var ext = qItem.extension[i];
        var extHandler = self.extensionHandlers[ext.url];
        // Extensions should be copied if they aren't handled, which means
        // 1) there isn't an extension handler or there is one that returns true (the signal to copy),  and
        // 2) they are not in the handledExtensions list.
        if ((!extHandler || (extHandler && extHandler(ext, lfItem))) &&
            !self.handledExtensionSet.has(qItem.extension[i].url)) {
          extensions.push(qItem.extension[i]);
        }
      }
    }
    if(extensions.length > 0) {
      lfItem.extension = extensions;
    }
  };


  /**
   * If the given entity is an array, it will return the array length, return -1 otherwise.
   * @param entity the given entity (can be anything) that needs to be tested to see if it's an array
   * @return {number} the array length or -1 if the given entity is not an array.
   * @private
   */
  self._arrayLen = function(entity) {
    return entity && Array.isArray(entity)? entity.length: -1;
  };


  /**
   * Get structural info of a QuestionnaireResponse item.answer.item in a way similar to that of item.item.
   * If any answer entry in item.answer has items, the qrItemInfo.qrAnswersItemsInfo will be assigned, which
   * will be an array where each element corresponds to one answer element in item.answer. When an answer entry
   * does not have any items, null will be used to fill the position.
   * @param qrItemInfo the structural info of the given item
   * @param item the item in a QuestionnaireResponse object whose answer.item structure is to be created.
   * @private
   */
  self._checkQRItemAnswerItems = function(qrItemInfo, item) {
    var answerLen = self._arrayLen(item.answer);
    if(answerLen < 1) {
      return;
    }

    var numAnswersWithItems = 0;
    var answersItemsInfo = []; // one entry for each answer; each entry is an qrItemsInfo array for the answer.item
    for (var i = 0; i < answerLen; i++) {
      if(this._arrayLen(item.answer[i].item) > 0) {
        answersItemsInfo.push({});
        self._mergeQR._checkQRItems(answersItemsInfo[i], item.answer[i]);
        ++ numAnswersWithItems;
      }
      else {
        answersItemsInfo.push(null);
      }
    }

    if(numAnswersWithItems > 0) {
      qrItemInfo.numAnswersWithItems = numAnswersWithItems;
      qrItemInfo.qrAnswersItemsInfo = answersItemsInfo;
    }
  };


  /**
   * Parse questionnaire item for restrictions
   *
   * @param lfItem {object} - LForms item object to assign restrictions
   * @param qItem {object} - Questionnaire item object
   * @private
   */
   self._processRestrictions = function (lfItem, qItem) {
    var restrictions = {};
    if(typeof qItem.maxLength !== 'undefined') {
      restrictions['maxLength'] = qItem.maxLength.toString();
    }

    for(var i = 0; i < self.fhirExtUrlRestrictionArray.length; i++) {
      var restriction = LForms.Util.findObjectInArray(qItem.extension, 'url', self.fhirExtUrlRestrictionArray[i]);
      var val = self._getFHIRValueWithPrefixKey(restriction, /^value/);
      if (val !== undefined && val !== null) {

        if(restriction.url.match(/minValue$/)) {
          // TODO -
          // There is no distinction between inclusive and exclusive.
          // Lforms looses this information when converting back and forth.
          restrictions['minInclusive'] = val;
        }
        else if(restriction.url.match(/maxValue$/)) {
          restrictions['maxInclusive'] = val;
        }
        else if(restriction.url.match(/minLength$/)) {
          restrictions['minLength'] = val;
        }
        else if(restriction.url.match(/regex$/)) {
          restrictions['pattern'] = val;
        }
        else if(restriction.url.match(/maxDecimalPlaces$/)) {
          restrictions['maxDecimalPlaces'] = parseInt(val);
        }
      }
    }

    if(!LForms.jQuery.isEmptyObject(restrictions)) {
      lfItem.restrictions = restrictions;
    }
  };

}

export default addCommonSDCImportFns;
