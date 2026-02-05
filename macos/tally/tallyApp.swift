//
//  tallyApp.swift
//  tally
//
//  Created by Hadi Hamoud on 1/31/26.
//

import SwiftUI

@main
struct tallyApp: App {
    @State var currentNumber: String = "1"
    var body: some Scene {
        
        MenuBarExtra("Tally", systemImage: "\(currentNumber).circle"){
            ContentView().frame(width: 400, height:200)
        }.menuBarExtraStyle(.window)
    }
    
    
    
}
