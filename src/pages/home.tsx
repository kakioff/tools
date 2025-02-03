import frustrated from "@/assets/imgs/frustrated.png"
export default function Home() {

    return (
        <div className=' px-4 pb-4 space-y-5 relative h-full'>
            <div className="bg-white rounded-full w-1/4 aspect-square absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <img src={frustrated} alt="logo" className="w-full h-full object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-3xl bg-background/60" />
        </div>
    );

};