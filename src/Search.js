import React, { Component } from 'react'
import { withLeaflet } from 'react-leaflet'
import { ReactLeafletSearch } from 'react-leaflet-search'

function Search(props) {
    return (
        <ReactLeafletSearch
        position="topleft"
        inputPlaceholder="The default text in the search bar"
        showMarker={false}
        showPopup={false}
        closeResultsOnClick={true}
        />
    )
}

export default withLeaflet(Search)