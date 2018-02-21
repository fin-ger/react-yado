import React, { Component } from 'react';
import './App.css';
import {Card, Header, Image, Segment} from "semantic-ui-react";
import io from 'socket.io-client';

import * as Color from 'color';

const TextHandle = props => {

    const currentTime = new Date();
    let fontSize = props.fontSize || 1;

    fontSize = props.fontSize + 'em';

    const textBackground = props.textBackground || 'white';

    const textColor = new Color(props.textBackground);

    const textColorPrint = textColor.light() ? 'black' : 'white';


    return (
        <div className={'CardContainer'}>
            <Card fluid>
                <div className={'TextHandleHeaderContainer'} style={{fontSize, color: textColorPrint, backgroundColor: textBackground}}>
                    <Header>{props.text}</Header>
                </div>
                <Card.Content>
                    <Card.Header>
                        {props.header}
                    </Card.Header>
                    <Card.Meta>
                        <span style={{color: 'green'}} className='date'>
                            Zuletzt aktualisiert: {currentTime.toLocaleTimeString('de-DE')} Uhr
                        </span>
                    </Card.Meta>
                    <Card.Description>
                        {props.description}
                    </Card.Description>
                </Card.Content>
            </Card>
        </div>
    )
};

const PlaceholderHandle = props =>  {
    return (
        <div className="CardContainer">
            <Card fluid>
                <div className={'TextHandleHeaderContainer'}>
                    <Image style={{opacity: 0.5}}fluid src={'ic_sentiment_dissatisfied_black_48px.svg'}/>

                </div>
                <Card.Content>
                    <Card.Header>
                        Keine Daten.
                    </Card.Header>
                    <Card.Description>
                        Es gibt zur Zeit keine Daten, die hier gezeigt werden könnten.
                    </Card.Description>
                </Card.Content>
            </Card>

        </div>
    )
}

const DoorHandle = props => {
    return (
        <TextHandle
            text={props.state ? 'Offen' : 'Zu'}
            textBackground={props.state ? '#66BB6A' : '#EF5350'}
            description={props.description}
            header={props.header}
            fontSize={2}
        />
    )
}

class App extends Component {

    constructor() {
        super();

        this.state = {
            cards: [],
            isConnected: false
        };

        //const serverSocket = io();
        const serverSocket = io('http://141.44.194.18:8002/');
        serverSocket.on('connect', () => {
            this.setState({
                isConnected: true,
                cards: []
            })
        });

        serverSocket.on('card change', (cardData) => {
            const cleanedCards = this.state.cards.filter((c) => c.name !== cardData.name);
            cleanedCards.push(cardData);

            this.setState({
                cards: cleanedCards
            })

        });

        serverSocket.on('card remove', (cardNameToRmeove) => {
            const cleanedCards = this.state.cards.filter((c) => c.name !== cardNameToRmeove);
            this.setState({
                cards: cleanedCards
            })
        });

        serverSocket.on('disconnect', () => {
            this.setState({
                isConnected: false
            })
        })
    }

    render() {
        return (
            <div className="App">
                <div className="Header">
                    <Image src="https://farafin.de/sites/default/files/zeropoint_logo.png"/>
                    <span>
                        <b>FaraFin - Open Information Portal</b><br/>
                        <small>Gebaut von Fin & Johann</small>
                    </span>
                </div>
                <div className="CardHolder">
                    {!this.state.isConnected ? (<Segment loading style={{width: '280px', height: '400px'}}/>
                    ): null}
                    {this.state.isConnected && this.state.cards.length <= 0 ? <PlaceholderHandle/> : null}
                    {this.state.isConnected && this.state.cards.map(card => {

                        if(card.type === 'door') {
                            return (
                                <DoorHandle
                                    key={card.name}
                                    state={card.data === "open"}
                                    header={card.name}
                                    description={card.description}
                                />
                            )
                        } else {

                            return (
                                <TextHandle
                                    key={card.name}
                                    text={card.data}
                                    header={card.name}
                                    description={card.description}
                                />
                            )
                        }

                    })}

                </div>
            </div>
        );
    }
}

export default App;
