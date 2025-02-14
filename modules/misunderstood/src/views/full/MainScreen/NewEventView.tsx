import { Button, ButtonGroup, Intent } from '@blueprintjs/core'
import { AxiosStatic } from 'axios'
import { lang } from 'botpress/shared'
import { SplashScreen } from 'botpress/ui'
import pick from 'lodash/pick'
import React from 'react'

import { ApiFlaggedEvent, RESOLUTION_TYPE, ResolutionData } from '../../../types'
import StickyActionBar from '../StickyActionBar'

import style from './style.scss'
import AmendForm from './AmendForm'
import ChatPreview from './ChatPreview'

interface Props {
  axios: AxiosStatic
  language: string
  event: ApiFlaggedEvent | null
  eventNotFound: boolean
  totalEventsCount: number
  eventIndex: number
  skipEvent: () => void
  deleteEvent: () => void
  amendEvent: (resolutionData: ResolutionData) => void
}

interface State {
  isAmending: boolean
  resolutionType: RESOLUTION_TYPE | null
  resolution: string | null
  resolutionParams: string | object | null
}

class NewEventView extends React.Component<Props, State> {
  state = {
    isAmending: false,
    resolutionType: null,
    resolution: null,
    resolutionParams: null
  }

  startAmend = () => {
    this.setState({ isAmending: true })
  }

  cancelAmend = () => {
    this.setState({ isAmending: false, resolutionType: null, resolution: null, resolutionParams: null })
  }

  confirmAmend = () => {
    const { amendEvent } = this.props
    amendEvent(pick(this.state, 'resolutionType', 'resolution', 'resolutionParams'))
    this.setState({ isAmending: false, resolutionType: null, resolution: null, resolutionParams: null })
  }

  setAmendMode = (resolutionType: RESOLUTION_TYPE) => {
    this.setState({ resolutionType })
  }

  selectResolution = (resolution: string | null) => {
    this.setState({
      resolution
    })
  }

  updateResolutionParams = (resolutionParams: string | object | null) => {
    this.setState({
      resolutionParams: resolutionParams || null
    })
  }

  render() {
    const { axios, language, event, totalEventsCount, eventIndex, skipEvent, deleteEvent, eventNotFound } = this.props
    const { isAmending, resolutionType, resolution, resolutionParams } = this.state

    return (
      <>
        <h3>{lang.tr('module.misunderstood.newMisunderstood', { eventIndex, totalEventsCount })}</h3>

        {!isAmending && (
          <>
            {eventNotFound ? (
              <SplashScreen
                title={lang.tr('module.misunderstood.couldNotLoadConversation')}
                description={lang.tr('module.misunderstood.conversationDeleted')}
                icon="warning-sign"
              />
            ) : (
              <ChatPreview messages={event.context} />
            )}
            <StickyActionBar>
              <Button onClick={deleteEvent} icon="trash" intent={Intent.DANGER} disabled={isAmending}>
                {lang.tr('module.misunderstood.ignore')}
              </Button>
              <Button
                onClick={skipEvent}
                icon="arrow-right"
                intent={Intent.WARNING}
                disabled={isAmending || eventIndex === totalEventsCount - 1}
              >
                {lang.tr('module.misunderstood.skip')}
              </Button>
              <Button onClick={this.startAmend} icon="confirm" intent={Intent.PRIMARY} disabled={isAmending}>
                {lang.tr('module.misunderstood.amend')}
              </Button>
            </StickyActionBar>
          </>
        )}

        {event && (
          <h4 className={style.newEventPreview}>
            {lang.tr('module.misunderstood.showMisunderstoodMessage', {
              preview: <span className={style.newEventPreviewMessage}>{event.preview}</span>
            })}
          </h4>
        )}

        {isAmending && (
          <AmendForm
            language={language}
            axios={axios}
            event={event}
            mode={resolutionType}
            setMode={this.setAmendMode}
            resolution={resolution}
            resolutionParams={resolutionParams}
            onSelect={this.selectResolution}
            onParamsUpdate={this.updateResolutionParams}
            onSave={this.confirmAmend}
            onCancel={this.cancelAmend}
          />
        )}
      </>
    )
  }
}

export default NewEventView
