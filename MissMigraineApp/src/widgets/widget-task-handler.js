import { QuickLogWidget } from './QuickLogWidget';

export async function widgetTaskHandler(props) {
  const { widgetAction, clickAction, renderWidget } = props;

  // This renders the widget when it's added to the home screen
  if (widgetAction === 'WIDGET_ADDED' || widgetAction === 'WIDGET_UPDATE') {
    renderWidget(<QuickLogWidget />);
  }
}