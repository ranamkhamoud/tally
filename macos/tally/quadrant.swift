//
//  quadrant.swift
//  tally
//
//  Created by Hadi Hamoud on 1/31/26.
//

import SwiftUI

struct UIQuadrant: View {
    let title: String
    var body: some View {
        ZStack{
            Color.clear
            ScrollView(showsIndicators: false){
                
                LazyVStack {
                    List {
                        Text("A List Item")
                        Text("A Second List Item")
                        Text("A Third List Item").truncationMode(.tail).lineLimit(1)
                        Text("A Third List Item")
                        Text("A Third List Item")
                    }
                    .padding().scrollContentBackground(.hidden)
                }
            }.scrollBounceBehavior(.basedOnSize, axes: [.vertical])
        }
        
    }
}
