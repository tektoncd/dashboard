import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-ATHzeHXA.js";import{t as n}from"./es-BERic32k.js";import{r}from"./AccordionItem-B6Am1NDQ.js";import{n as i,t as a}from"./AccordionItem-jGJKrhNs.js";var o,s,c,l,u,d;function f(){return(f=e((()=>{n(),i(),o=t(),s={component:a,title:`AccordionItem`},c={args:{open:!1,title:`Closed Accordion Item`,children:(0,o.jsx)(`div`,{children:`This content is not rendered when closed`})},decorators:[e=>(0,o.jsx)(r,{children:(0,o.jsx)(e,{})})]},l={args:{open:!0,title:`Open Accordion Item`,children:(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`p`,{children:`This content is rendered when open`}),(0,o.jsx)(`p`,{children:`The AccordionItem optimizes rendering by only rendering children when open`})]})},decorators:[e=>(0,o.jsx)(r,{children:(0,o.jsx)(e,{})})]},u={render:()=>(0,o.jsxs)(r,{children:[(0,o.jsx)(a,{open:!0,title:`First Item`,children:(0,o.jsx)(`p`,{children:`Content of first item`})}),(0,o.jsx)(a,{open:!1,title:`Second Item`,children:(0,o.jsx)(`p`,{children:`Content of second item (not rendered)`})}),(0,o.jsx)(a,{open:!0,title:`Third Item`,children:(0,o.jsx)(`p`,{children:`Content of third item`})})]})},d=[`Closed`,`Open`,`MultipleItems`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    open: false,
    title: 'Closed Accordion Item',
    children: <div>This content is not rendered when closed</div>
  },
  decorators: [Story => <Accordion>
        <Story />
      </Accordion>]
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    title: 'Open Accordion Item',
    children: <div>
        <p>This content is rendered when open</p>
        <p>
          The AccordionItem optimizes rendering by only rendering children when
          open
        </p>
      </div>
  },
  decorators: [Story => <Accordion>
        <Story />
      </Accordion>]
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Accordion>
      <AccordionItem open title="First Item">
        <p>Content of first item</p>
      </AccordionItem>
      <AccordionItem open={false} title="Second Item">
        <p>Content of second item (not rendered)</p>
      </AccordionItem>
      <AccordionItem open title="Third Item">
        <p>Content of third item</p>
      </AccordionItem>
    </Accordion>
}`,...u.parameters?.docs?.source}}}})))()}f();export{c as Closed,u as MultipleItems,l as Open,d as __namedExportsOrder,s as default};