import {useState, useEffect} from 'react'
import Form from "@rjsf/core"

import { TabView, TabPanel } from 'primereact/tabview'
import { Fieldset } from 'primereact/fieldset'
import { Button } from 'primereact/button'
import { Panel } from 'primereact/panel'
import { Accordion, AccordionTab } from 'primereact/accordion'

import compactListUiSchema from './compactList'
import templateGroupUiSchema from './templateGroup'
import customFields from './customFields'

import './anatomy.sass'


const WrapperTemplate = (props) => {
  return (
    <Accordion multiple transitionOptions={{ timeout: 0 }} >
      {props.properties.map(element => {
        return <AccordionTab 
          key={element.name}
          header={element.content.props.schema.title}
        >
          
          <div style={{padding: '1em 0'}}>
            {element.content}
          </div>
        </AccordionTab>
        }
      )}
    </Accordion>
  );
}

const TopLevelObjectFieldTemplate = (props) => {
  return (
    <div>
      {props.properties.map(element => element.content)}
    </div>
  );
}


const SettingsFieldTemplate = (props) => {
  if (props.displayLabel)
    return (
      <div className="settings-field">
        <div className="p-inputgroup">
          {props.displayLabel && <span className="p-inputgroup-addon settings-field-label">{props.label} </span>}
          {props.children}
        </div>  
        <small className="p-error block">{props.rawErrors || <>&nbsp;</>}</small>
      </div>
    )

  return props.children
}


const AnatomyEditor = (schema, values, onChange) => {
  const topLevelFields = {
      "ui:ObjectFieldTemplate": TopLevelObjectFieldTemplate,
  }

  const uischema = {
    "ui:rootFieldId": "jform",
    "ui:ObjectFieldTemplate": WrapperTemplate,
    "roots" : compactListUiSchema,

    "templates": {
      ...topLevelFields,
      "work": templateGroupUiSchema,
      "render": templateGroupUiSchema,
      "publish": templateGroupUiSchema,
      "hero": templateGroupUiSchema,
      "delivery": templateGroupUiSchema,
      "others": templateGroupUiSchema,
    },

    "attributes": {
      ...topLevelFields,
      applications: {
        "ui:field": "multiselect"
      }
    },

    "folder_types": compactListUiSchema,
    "task_types": compactListUiSchema,
}

  return (
    <Panel 
      header="Project anatomy template"
      style={{
        width: 900,
        margin: "50px auto"
      }}
    >
      {schema && <Form 
        schema={schema} 
        formData={values} 
        uiSchema={uischema}
        onChange={(evt) => onChange(evt.formData)}
        fields={customFields}
        liveValidate={true}
        FieldTemplate={SettingsFieldTemplate}
        children={<></>}
      />}
    </Panel>
  )
}

export default AnatomyEditor
