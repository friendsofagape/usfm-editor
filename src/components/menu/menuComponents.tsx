import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cx, css } from 'emotion'

export const Button = React.forwardRef<HTMLSpanElement, ButtonProps>(
  ({ className, active = false, reversed = false, ...props }: ButtonProps, ref) => (
    <span
      { ...props }
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

Button.displayName = 'Button';

interface ButtonProps extends React.HTMLProps<HTMLSpanElement> {
  active?: boolean,
  reversed?: boolean
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(({ className, ...props }: MenuProps, ref) => (
  <div
    { ...props }
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

Menu.displayName = "Menu"

type MenuProps = React.HTMLProps<HTMLDivElement>

export const Portal: React.FC = ({ children }) => {
  return ReactDOM.createPortal(children, document.body)
}
