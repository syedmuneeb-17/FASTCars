const sampleListings = [
    {
      name: "Anonymous",
      email: "anonymous1@nu.edu.pk",
      number_plate: "XYZ789",
      overspeeding_amount: 75,
      is_fine_paid: false,
      photo:{
        filename: "listingimage",
        url: "https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous2@nu.edu.pk",
      number_plate: "LMN456",
      overspeeding_amount: 50,
      is_fine_paid: true,
      photo: {
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous3@nu.edu.pk",
      number_plate: "GHI101",
      overspeeding_amount: 60,
      is_fine_paid: false,
      photo: {
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous4@nu.edu.pk",
      number_plate: "QWE321",
      overspeeding_amount: 85,
      is_fine_paid: false,
      photo:{ 
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous5@nu.edu.pk",
      number_plate: "RTY654",
      overspeeding_amount: 40,
      is_fine_paid: true,
      photo: {
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous6@nu.edu.pk",
      number_plate: "UOP112",
      overspeeding_amount: 55,
      is_fine_paid: false,
      photo:{
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous7@nu.edu.pk",
      number_plate: "ASD987",
      overspeeding_amount: 30,
      is_fine_paid: true,
      photo:{
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous8@nu.edu.pk",
      number_plate: "JKL258",
      overspeeding_amount: 70,
      is_fine_paid: false,
      photo:{ 
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous9@nu.edu.pk",
      number_plate: "VBN369",
      overspeeding_amount: 90,
      is_fine_paid: true,
      photo:{ 
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous10@nu.edu.pk",
      number_plate: "TYU753",
      overspeeding_amount: 35,
      is_fine_paid: false,
      photo:{ 
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous11@nu.edu.pk",
      number_plate: "FGH147",
      overspeeding_amount: 65,
      is_fine_paid: true,
      photo:{ 
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    {
      name: "Anonymous",
      email: "anonymous12@nu.edu.pk",
      number_plate: "ZXC963",
      overspeeding_amount: 45,
      is_fine_paid: false,
      photo:{ 
        filename: "listingimage",
        url:"https://images.unsplash.com/photo-1504381270825-025726abb1de?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    },
    
  ];
  
  module.exports = { data: sampleListings };