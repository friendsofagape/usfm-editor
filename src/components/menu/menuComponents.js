import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cx, css } from 'emotion'

export const Button = React.forwardRef(
  ({ className, active, reversed, ...props }, ref) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
            ? active
              ? 'black'
              : '#ccc'
            : active
              ? 'white'
              : '#aaa'};
        `
      )}
    />
  )
)

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        & > * {
          display: inline-block;
        }

        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
))

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body)
}